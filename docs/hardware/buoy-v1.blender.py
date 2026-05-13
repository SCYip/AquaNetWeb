"""
AquaNet 水眸 · Buoy v1 — Blender model builder
================================================

Generates the v1 buoy assembly from the spec in `buoy-v1.md`.
Drop this file into Blender's Scripting workspace and press Run,
or from the shell:

    blender --background --python docs/hardware/buoy-v1.blender.py

Tested on Blender 4.x. Pure bpy — no addons required.

What it creates
---------------
- Collection "AquaNet_Buoy_v1"
  - "Hull"           — PVC pipe + caps
  - "Foam"           — closed-cell foam collar
  - "TopAssembly"    — solar panel, polycarbonate cover, antenna, LEDs
  - "Sensors"        — temp / pH / turbidity probes on cables
  - "Anchor"         — ballast + eye + rope to mushroom anchor
  - "Electronics"    — Shelf A (MCU) + Shelf B (power) inside the hull

Pick a section view: solo "Electronics" + "Hull" with Alt+H, switch to
front view (Numpad 1), enable X-Ray (Alt+Z), and you'll see the
internal layout.
"""

import bpy
import math

# ─── units ─────────────────────────────────────────────────────────────
MM = 0.001  # blender works in metres; multiply mm by this

# ─── master dimensions ─────────────────────────────────────────────────
PIPE_OD       = 110 * MM
PIPE_ID       = 104 * MM
PIPE_LEN      = 500 * MM     # main body (above + below waterline)
TOP_CAP_H     =  20 * MM
BOT_CAP_H     =  20 * MM
FOAM_OD       = 200 * MM
FOAM_H        =  80 * MM
SOLAR_W       = 165 * MM
SOLAR_D       = 135 * MM
SOLAR_T       =   6 * MM
PC_COVER_T    =   3 * MM
ANTENNA_H     =  60 * MM
SENSOR_LEN    = 180 * MM     # how far probes hang below bottom cap
BALLAST_H     =  20 * MM
ANCHOR_H      = 120 * MM
ROPE_LEN      = 5000 * MM

# Waterline is the world origin (z = 0). Everything above is in air,
# everything below is submerged.

WATERLINE_Z   = 0
HULL_TOP_Z    = 350 * MM
HULL_BOT_Z    = -150 * MM
FOAM_BOTTOM_Z = HULL_BOT_Z + 30 * MM
SENSOR_TOP_Z  = HULL_BOT_Z
ANCHOR_EYE_Z  = HULL_BOT_Z - 30 * MM


# ─── helpers ───────────────────────────────────────────────────────────
def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for col in list(bpy.data.collections):
        if col.name != "Collection":
            bpy.data.collections.remove(col)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)


def get_or_make_collection(name, parent=None):
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    col = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(col)
    return col


def link_to(obj, collection):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    collection.objects.link(obj)


def make_material(name, base_color, roughness=0.6, metallic=0.0, alpha=1.0):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base_color, alpha)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        mat.blend_method = "BLEND"
    return mat


def assign_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def cylinder(name, radius, depth, location=(0, 0, 0), verts=64):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    return obj


def tube(name, outer_r, inner_r, depth, location=(0, 0, 0), verts=64):
    outer = cylinder(name, outer_r, depth, location, verts)
    inner = cylinder(name + "_BORE", inner_r, depth + 0.002, location, verts)
    mod = outer.modifiers.new(name="Bore", type="BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = inner
    bpy.context.view_layer.objects.active = outer
    bpy.ops.object.modifier_apply(modifier="Bore")
    bpy.data.objects.remove(inner, do_unlink=True)
    return outer


def disc(name, radius, thickness, location=(0, 0, 0), verts=64):
    return cylinder(name, radius, thickness, location, verts)


def box(name, x, y, z, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (x / 2, y / 2, z / 2)
    bpy.ops.object.transform_apply(scale=True)
    return obj


def torus(name, major_r, minor_r, location=(0, 0, 0), maj_seg=64, min_seg=16):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_r,
        minor_radius=minor_r,
        location=location,
        major_segments=maj_seg,
        minor_segments=min_seg,
    )
    obj = bpy.context.active_object
    obj.name = name
    return obj


# ─── materials palette ─────────────────────────────────────────────────
def build_materials():
    return {
        "pvc":        make_material("MAT_PVC",        (0.93, 0.92, 0.88), 0.55),
        "pvc_cap":    make_material("MAT_PVC_CAP",    (0.85, 0.84, 0.80), 0.55),
        "foam":       make_material("MAT_FOAM",       (0.86, 0.74, 0.45), 0.95),
        "solar":      make_material("MAT_SOLAR",      (0.04, 0.18, 0.27), 0.25, metallic=0.4),
        "pc_clear":   make_material("MAT_PC_CLEAR",   (0.90, 0.94, 0.97), 0.10, alpha=0.25),
        "led":        make_material("MAT_LED",        (0.20, 0.85, 0.65), 0.30),
        "metal":      make_material("MAT_METAL",      (0.75, 0.78, 0.80), 0.30, metallic=0.9),
        "rubber":     make_material("MAT_RUBBER",     (0.10, 0.10, 0.12), 0.85),
        "esp32":      make_material("MAT_ESP32",      (0.20, 0.56, 0.49), 0.55),
        "pcb_blue":   make_material("MAT_PCB_BLUE",   (0.10, 0.30, 0.41), 0.55),
        "battery":    make_material("MAT_BATTERY",    (0.53, 0.63, 0.70), 0.40, metallic=0.6),
        "pcb_red":    make_material("MAT_PCB_RED",    (0.64, 0.29, 0.16), 0.55),
        "acrylic":    make_material("MAT_ACRYLIC",    (0.95, 0.95, 0.97), 0.05, alpha=0.30),
        "ballast":    make_material("MAT_LEAD",       (0.18, 0.20, 0.25), 0.55, metallic=0.7),
        "rope":       make_material("MAT_ROPE",       (1.00, 0.55, 0.20), 0.90),
        "anchor":     make_material("MAT_ANCHOR",     (0.18, 0.20, 0.22), 0.75, metallic=0.5),
        "cable_red":  make_material("MAT_CABLE_RED",  (0.60, 0.18, 0.15), 0.55),
        "cable_blue": make_material("MAT_CABLE_BLUE", (0.16, 0.32, 0.45), 0.55),
        "cable_grey": make_material("MAT_CABLE_GREY", (0.40, 0.43, 0.46), 0.55),
        "probe_temp": make_material("MAT_PROBE_TEMP", (0.78, 0.80, 0.82), 0.30, metallic=0.6),
        "probe_ph":   make_material("MAT_PROBE_PH",   (0.20, 0.50, 0.55), 0.40),
        "probe_turb": make_material("MAT_PROBE_TURB", (0.10, 0.12, 0.15), 0.50),
    }


# ─── components ────────────────────────────────────────────────────────
def build_hull(mats, col):
    pipe_z = (HULL_TOP_Z - TOP_CAP_H + HULL_BOT_Z + BOT_CAP_H) / 2
    pipe_depth = (HULL_TOP_Z - TOP_CAP_H) - (HULL_BOT_Z + BOT_CAP_H)

    pipe = tube("Hull.Pipe", PIPE_OD / 2, PIPE_ID / 2, pipe_depth,
                location=(0, 0, pipe_z))
    assign_mat(pipe, mats["pvc"])
    link_to(pipe, col)

    top_cap = disc("Hull.TopCap", PIPE_OD / 2, TOP_CAP_H,
                   location=(0, 0, HULL_TOP_Z - TOP_CAP_H / 2))
    assign_mat(top_cap, mats["pvc_cap"])
    link_to(top_cap, col)

    bot_cap = disc("Hull.BottomCap", PIPE_OD / 2, BOT_CAP_H,
                   location=(0, 0, HULL_BOT_Z + BOT_CAP_H / 2))
    assign_mat(bot_cap, mats["pvc_cap"])
    link_to(bot_cap, col)

    bolt_r = PIPE_OD / 2 - 6 * MM
    for i in range(4):
        a = (i / 4) * math.tau
        b = cylinder("Hull.HatchBolt", 2 * MM, 4 * MM,
                     location=(bolt_r * math.cos(a),
                               bolt_r * math.sin(a),
                               HULL_TOP_Z - TOP_CAP_H + 2 * MM),
                     verts=16)
        assign_mat(b, mats["metal"])
        link_to(b, col)


def build_top_assembly(mats, col):
    base_z = HULL_TOP_Z + SOLAR_T / 2
    panel = box("Top.SolarPanel", SOLAR_W, SOLAR_D, SOLAR_T,
                location=(0, 0, base_z))
    assign_mat(panel, mats["solar"])
    link_to(panel, col)

    cover = box("Top.PCCover", SOLAR_W + 12 * MM, SOLAR_D + 12 * MM, PC_COVER_T,
                location=(0, 0, base_z + SOLAR_T / 2 + PC_COVER_T / 2))
    assign_mat(cover, mats["pc_clear"])
    link_to(cover, col)

    ant = cylinder("Top.Antenna", 2 * MM, ANTENNA_H,
                   location=(0, 25 * MM, base_z + SOLAR_T / 2 + ANTENNA_H / 2),
                   verts=12)
    assign_mat(ant, mats["rubber"])
    link_to(ant, col)
    tip = cylinder("Top.AntennaTip", 3 * MM, 6 * MM,
                   location=(0, 25 * MM,
                             base_z + SOLAR_T / 2 + ANTENNA_H + 3 * MM),
                   verts=12)
    assign_mat(tip, mats["metal"])
    link_to(tip, col)

    sma = cylinder("Top.SMA", 4 * MM, 8 * MM,
                   location=(0, 30 * MM, HULL_TOP_Z - TOP_CAP_H + 4 * MM),
                   verts=16)
    assign_mat(sma, mats["metal"])
    link_to(sma, col)

    led_z = HULL_TOP_Z - TOP_CAP_H - 12 * MM
    led_r = PIPE_OD / 2 + 0.5 * MM
    for i in range(5):
        a = -math.pi / 2 + (i - 2) * (12 * math.pi / 180)
        led = cylinder("Top.LED", 2 * MM, 2 * MM,
                       location=(led_r * math.cos(a),
                                 led_r * math.sin(a),
                                 led_z),
                       verts=16)
        led.rotation_euler = (math.pi / 2, 0, a + math.pi / 2)
        assign_mat(led, mats["led"])
        link_to(led, col)


def build_foam(mats, col):
    foam = cylinder("Foam.Collar", FOAM_OD / 2, FOAM_H,
                    location=(0, 0, FOAM_BOTTOM_Z + FOAM_H / 2), verts=96)
    bore = cylinder("Foam.Bore", PIPE_OD / 2 + 0.5 * MM, FOAM_H + 4 * MM,
                    location=(0, 0, FOAM_BOTTOM_Z + FOAM_H / 2), verts=64)
    m = foam.modifiers.new("Bore", type="BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = bore
    bpy.context.view_layer.objects.active = foam
    bpy.ops.object.modifier_apply(modifier="Bore")
    bpy.data.objects.remove(bore, do_unlink=True)
    assign_mat(foam, mats["foam"])
    link_to(foam, col)


def build_sensors(mats, col):
    cable_top_z = HULL_BOT_Z + BOT_CAP_H / 2
    probe_y_offsets = [-18 * MM, 0, 18 * MM]
    cable_mats = [mats["cable_red"], mats["cable_blue"], mats["cable_grey"]]
    probe_mats = [mats["probe_temp"], mats["probe_ph"], mats["probe_turb"]]
    probe_names = ["DS18B20", "pH_probe", "Turbidity"]

    for yo, cm, pm, pname in zip(
        probe_y_offsets, cable_mats, probe_mats, probe_names
    ):
        cable_top = cable_top_z
        cable_bot = cable_top_z - SENSOR_LEN + 30 * MM
        cable_z = (cable_top + cable_bot) / 2
        cable_depth = cable_top - cable_bot

        cable = cylinder(f"Sensor.{pname}.Cable", 1.5 * MM, cable_depth,
                         location=(0, yo, cable_z), verts=12)
        assign_mat(cable, cm)
        link_to(cable, col)

        probe_h = 28 * MM
        probe_z = cable_bot - probe_h / 2
        probe = cylinder(f"Sensor.{pname}", 4 * MM, probe_h,
                         location=(0, yo, probe_z), verts=24)
        assign_mat(probe, pm)
        link_to(probe, col)


def build_anchor_chain(mats, col):
    ballast = disc("Anchor.LeadBallast", PIPE_ID / 2 - 1 * MM, BALLAST_H,
                   location=(0, 0, HULL_BOT_Z + BOT_CAP_H + BALLAST_H / 2))
    assign_mat(ballast, mats["ballast"])
    link_to(ballast, col)

    eye = torus("Anchor.Eye", 8 * MM, 2 * MM,
                location=(0, 0, ANCHOR_EYE_Z), maj_seg=32, min_seg=12)
    eye.rotation_euler = (math.pi / 2, 0, 0)
    assign_mat(eye, mats["metal"])
    link_to(eye, col)

    rope_top = ANCHOR_EYE_Z - 12 * MM
    rope_bot = rope_top - ROPE_LEN
    rope = cylinder("Anchor.Rope", 4 * MM, ROPE_LEN,
                    location=(0, 0, (rope_top + rope_bot) / 2), verts=12)
    assign_mat(rope, mats["rope"])
    link_to(rope, col)

    cap = cylinder("Anchor.MushroomCap", 100 * MM, 30 * MM,
                   location=(0, 0, rope_bot - 15 * MM), verts=48)
    stem = cylinder("Anchor.MushroomStem", 15 * MM, 60 * MM,
                    location=(0, 0, rope_bot + 30 * MM), verts=24)
    for o in (cap, stem):
        assign_mat(o, mats["anchor"])
        link_to(o, col)


def build_electronics(mats, col):
    SHELF_A_Z = 180 * MM
    SHELF_B_Z =  20 * MM
    shelf_r   = PIPE_ID / 2 - 1 * MM
    shelf_t   =   3 * MM

    shelf_a = disc("Elec.ShelfA", shelf_r, shelf_t, location=(0, 0, SHELF_A_Z))
    shelf_b = disc("Elec.ShelfB", shelf_r, shelf_t, location=(0, 0, SHELF_B_Z))
    for s in (shelf_a, shelf_b):
        assign_mat(s, mats["acrylic"])
        link_to(s, col)

    rod_r = 1.5 * MM
    rod_circle_r = shelf_r - 6 * MM
    rod_z = (SHELF_A_Z + SHELF_B_Z) / 2
    rod_h = SHELF_A_Z - SHELF_B_Z
    for i in range(4):
        a = math.pi / 4 + i * math.pi / 2
        rod = cylinder("Elec.Rod", rod_r, rod_h + shelf_t * 2,
                       location=(rod_circle_r * math.cos(a),
                                 rod_circle_r * math.sin(a),
                                 rod_z),
                       verts=8)
        assign_mat(rod, mats["metal"])
        link_to(rod, col)

    # — Shelf A contents (ESP32 + analog) —
    esp = box("Elec.ESP32S3", 60 * MM, 25 * MM, 8 * MM,
              location=(-12 * MM, 0, SHELF_A_Z + shelf_t / 2 + 4 * MM))
    assign_mat(esp, mats["esp32"])
    link_to(esp, col)

    usb = box("Elec.ESP32.USB", 8 * MM, 6 * MM, 3 * MM,
              location=(-12 * MM - 30 * MM, 0,
                        SHELF_A_Z + shelf_t / 2 + 4 * MM))
    assign_mat(usb, mats["metal"])
    link_to(usb, col)

    ads = box("Elec.ADS1115", 20 * MM, 14 * MM, 4 * MM,
              location=(28 * MM, -10 * MM,
                        SHELF_A_Z + shelf_t / 2 + 2 * MM))
    assign_mat(ads, mats["pcb_blue"])
    link_to(ads, col)

    rtc = box("Elec.RTC.DS3231", 22 * MM, 14 * MM, 5 * MM,
              location=(28 * MM, 10 * MM,
                        SHELF_A_Z + shelf_t / 2 + 2.5 * MM))
    assign_mat(rtc, mats["pcb_blue"])
    link_to(rtc, col)

    ph_amp = box("Elec.pHAmp", 30 * MM, 22 * MM, 6 * MM,
                 location=(-30 * MM, 18 * MM,
                           SHELF_A_Z + shelf_t / 2 + 3 * MM))
    assign_mat(ph_amp, mats["pcb_blue"])
    link_to(ph_amp, col)

    turb_amp = box("Elec.TurbAmp", 30 * MM, 16 * MM, 5 * MM,
                   location=(-30 * MM, -18 * MM,
                             SHELF_A_Z + shelf_t / 2 + 2.5 * MM))
    assign_mat(turb_amp, mats["pcb_red"])
    link_to(turb_amp, col)

    # — Shelf B contents (battery + power) —
    cell_r = 9 * MM
    cell_h = 65 * MM
    for i, x in enumerate([-10 * MM, 10 * MM]):
        cell = cylinder(f"Elec.Batt18650.{i+1}", cell_r, cell_h,
                        location=(x, 0,
                                  SHELF_B_Z + shelf_t / 2 + cell_h / 2 + 4 * MM),
                        verts=32)
        cell.rotation_euler = (math.pi / 2, 0, 0)
        cell.location.z = SHELF_B_Z + shelf_t / 2 + cell_r + 1 * MM
        assign_mat(cell, mats["battery"])
        link_to(cell, col)

    holder = box("Elec.BattHolder", 75 * MM, 22 * MM, 22 * MM,
                 location=(0, 0, SHELF_B_Z + shelf_t / 2 + 11 * MM))
    assign_mat(holder, mats["rubber"])
    link_to(holder, col)

    mppt = box("Elec.CN3791.MPPT", 32 * MM, 18 * MM, 6 * MM,
               location=(0, 32 * MM,
                         SHELF_B_Z + shelf_t / 2 + 3 * MM))
    assign_mat(mppt, mats["pcb_blue"])
    link_to(mppt, col)

    bms = box("Elec.BMS.1S2P", 28 * MM, 14 * MM, 4 * MM,
              location=(0, -32 * MM,
                        SHELF_B_Z + shelf_t / 2 + 2 * MM))
    assign_mat(bms, mats["pcb_red"])
    link_to(bms, col)

    sw_x = -(PIPE_ID / 2 - 8 * MM)
    sw = box("Elec.PowerSwitch", 14 * MM, 10 * MM, 8 * MM,
             location=(sw_x, 0, SHELF_A_Z - 30 * MM))
    sw.rotation_euler = (0, math.pi / 2, 0)
    assign_mat(sw, mats["rubber"])
    link_to(sw, col)


def setup_camera_and_light():
    bpy.ops.object.camera_add(location=(0.6, -0.9, 0.35),
                              rotation=(math.radians(70),
                                        0,
                                        math.radians(35)))
    cam = bpy.context.active_object
    cam.name = "Camera.Hero"
    cam.data.lens = 45
    bpy.context.scene.camera = cam

    bpy.ops.object.camera_add(location=(0, -1.2, 0.10),
                              rotation=(math.radians(90), 0, 0))
    sec = bpy.context.active_object
    sec.name = "Camera.Section"
    sec.data.type = "ORTHO"
    sec.data.ortho_scale = 0.85

    bpy.ops.object.light_add(type="SUN", location=(2, -1.5, 3))
    sun = bpy.context.active_object
    sun.data.energy = 4.0
    sun.data.angle = math.radians(8)
    sun.rotation_euler = (math.radians(45), math.radians(-15), 0)

    bpy.ops.object.light_add(type="AREA", location=(-1.5, -1, 1))
    fill = bpy.context.active_object
    fill.data.energy = 200
    fill.data.size = 1.2

    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.965, 0.940, 0.890, 1.0)
    bg.inputs["Strength"].default_value = 1.2


def setup_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 96
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 2000
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "MILLIMETERS"


def build_waterline(mats, col):
    bpy.ops.mesh.primitive_plane_add(size=1.5, location=(0, 0, WATERLINE_Z))
    p = bpy.context.active_object
    p.name = "Reference.Waterline"
    water_mat = make_material("MAT_WATER", (0.18, 0.36, 0.48), 0.05, alpha=0.35)
    assign_mat(p, water_mat)
    p.display_type = "WIRE"
    link_to(p, col)


def build():
    clear_scene()
    mats = build_materials()

    root = get_or_make_collection("AquaNet_Buoy_v1")
    hull_col   = get_or_make_collection("Hull",         parent=root)
    top_col    = get_or_make_collection("TopAssembly",  parent=root)
    foam_col   = get_or_make_collection("Foam",         parent=root)
    sens_col   = get_or_make_collection("Sensors",      parent=root)
    anchor_col = get_or_make_collection("Anchor",       parent=root)
    elec_col   = get_or_make_collection("Electronics",  parent=root)
    ref_col    = get_or_make_collection("Reference",    parent=root)

    build_hull(mats, hull_col)
    build_top_assembly(mats, top_col)
    build_foam(mats, foam_col)
    build_sensors(mats, sens_col)
    build_anchor_chain(mats, anchor_col)
    build_electronics(mats, elec_col)
    build_waterline(mats, ref_col)

    setup_camera_and_light()
    setup_render()

    # Optional: uncomment to export GLB you can use in three.js / web.
    # bpy.ops.export_scene.gltf(filepath="/tmp/aquanet-buoy.glb", export_format="GLB")

    print("AquaNet buoy v1 build complete.")
    print(f"Total parts: {sum(len(c.objects) for c in bpy.data.collections)}")


if __name__ == "__main__":
    build()
