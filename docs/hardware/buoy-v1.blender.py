"""
AquaNet 水眸 · Buoy v1 — Blender model builder
================================================

Builds a chunky safety-yellow marine buoy. Not a piece of pipe, not a
lab probe — a real-looking citizen-science instrument.

Form factor (top to bottom):
  - Clear acrylic dome with solar panel inside + antenna spire
  - Slim yellow sensor TOWER (Φ100mm × 320mm) with black accent rings
    and a side service hatch with 4 stainless bolts
  - Amber LED status ring at the top of the tower
  - Fat yellow float BODY (Φ280mm × 225mm) — the dominant visual mass,
    sits at the waterline like a marine fender
  - Hi-viz orange band recessed into the float at the waterline
  - Tapered dark tail KEEL leading to a sensor POD
  - Three probes hanging below: DS18B20 temp, BNC pH, optical turbidity
  - Stainless anchor eye at the very bottom

Internal:
  - Two acrylic shelves on 4× M3 threaded rods inside the tower
  - Shelf A: ESP32-S3, ADS1115 ADC, DS3231 RTC, pH amp, turbidity amp
  - Shelf B: 2× 18650 battery holder, CN3791 MPPT, BMS, power switch

Run from Blender's Scripting workspace, or:
    blender --background --python docs/hardware/buoy-v1.blender.py
"""

import bpy
import bmesh
import math

MM = 0.001


# ─── HELPERS ───────────────────────────────────────────────────────────
def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for c in list(bpy.data.collections):
        if c.name != "Collection":
            bpy.data.collections.remove(c)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for cam in list(bpy.data.cameras):
        bpy.data.cameras.remove(cam)
    for l in list(bpy.data.lights):
        bpy.data.lights.remove(l)


def col(name, parent=None):
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    c = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(c)
    return c


def link(obj, target):
    for cc in list(obj.users_collection):
        cc.objects.unlink(obj)
    target.objects.link(obj)


def make_mat(name, color, rough=0.55, metallic=0.0, alpha=1.0, clearcoat=0.0,
             emission_strength=0.0):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, alpha)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = clearcoat
    if emission_strength > 0:
        bsdf.inputs["Emission Color"].default_value = (*color, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    return m


def assign(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def lathe_profile(name, prof, target, steps=128):
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bm = bmesh.new()
    verts = [bm.verts.new((x, 0, z)) for (x, z) in prof]
    bm.faces.new(verts)
    bm.to_mesh(mesh); bm.free()
    link(obj, target)
    scr = obj.modifiers.new("Lathe", type="SCREW")
    scr.axis = "Z"; scr.angle = math.radians(360); scr.steps = steps
    scr.render_steps = steps; scr.use_smooth_shade = True
    scr.use_merge_vertices = True; scr.iterations = 1
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    return obj


def cyl(name, r, h, location=(0, 0, 0), verts=32, rot=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=location)
    o = bpy.context.active_object; o.name = name
    if rot: o.rotation_euler = rot
    return o


def box(name, x, y, z, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    o = bpy.context.active_object; o.name = name
    o.scale = (x / 2, y / 2, z / 2)
    bpy.ops.object.transform_apply(scale=True)
    return o


def torus(name, major_r, minor_r, location=(0, 0, 0), maj_seg=64, min_seg=12):
    bpy.ops.mesh.primitive_torus_add(major_radius=major_r, minor_radius=minor_r,
                                     location=location,
                                     major_segments=maj_seg, minor_segments=min_seg)
    o = bpy.context.active_object; o.name = name
    return o


# ─── MATERIALS ─────────────────────────────────────────────────────────
def build_materials():
    return {
        "yellow"      : make_mat("M_Marine_Yellow",   (0.96, 0.78, 0.05), rough=0.52, clearcoat=0.20),
        "orange"      : make_mat("M_HiViz_Orange",    (0.95, 0.35, 0.06), rough=0.45, clearcoat=0.25),
        "black_trim"  : make_mat("M_Black_Trim",      (0.05, 0.05, 0.06), rough=0.50, clearcoat=0.15),
        "dome_glass"  : make_mat("M_Dome_Glass",      (0.94, 0.96, 0.97), rough=0.04, alpha=0.30, clearcoat=0.70),
        "solar"       : make_mat("M_Solar_Navy",      (0.05, 0.10, 0.22), rough=0.18, metallic=0.55, clearcoat=0.40),
        "spire_clear" : make_mat("M_Spire_Clear",     (0.94, 0.96, 0.98), rough=0.04, alpha=0.20),
        "metal_ss"    : make_mat("M_Metal_SS",        (0.78, 0.80, 0.82), rough=0.20, metallic=0.95),
        "metal_dark"  : make_mat("M_Metal_Anodised",  (0.18, 0.18, 0.20), rough=0.30, metallic=0.80),
        "rubber"      : make_mat("M_Grip_Rubber",     (0.05, 0.05, 0.06), rough=0.85),
        "keel_dark"   : make_mat("M_Keel_Dark",       (0.10, 0.11, 0.13), rough=0.50, clearcoat=0.20),
        "led_amber"   : make_mat("M_LED_Amber",       (1.00, 0.55, 0.10), rough=0.20, emission_strength=2.5),
        "cable_red"   : make_mat("M_Cable_Red",       (0.58, 0.18, 0.16), rough=0.55),
        "cable_blue"  : make_mat("M_Cable_Blue",      (0.18, 0.32, 0.45), rough=0.55),
        "cable_grey"  : make_mat("M_Cable_Grey",      (0.40, 0.42, 0.46), rough=0.55),
        "probe_ph"    : make_mat("M_Probe_pH",        (0.18, 0.42, 0.50), rough=0.40),
        "probe_turb"  : make_mat("M_Probe_Turb",      (0.08, 0.10, 0.12), rough=0.45),
        "acrylic"     : make_mat("M_Acrylic_Tinted",  (0.78, 0.92, 0.96), rough=0.10, alpha=0.40, clearcoat=0.40),
        "esp32"       : make_mat("M_ESP32",           (0.10, 0.62, 0.50), rough=0.45),
        "pcb_blue"    : make_mat("M_PCB_Blue",        (0.10, 0.32, 0.50), rough=0.50),
        "pcb_red"     : make_mat("M_PCB_Red",         (0.62, 0.22, 0.12), rough=0.50),
        "battery"     : make_mat("M_Battery",         (0.42, 0.50, 0.60), rough=0.35, metallic=0.55),
        "holder"      : make_mat("M_BattHolder",      (0.10, 0.10, 0.12), rough=0.85),
        "rod"         : make_mat("M_M3_Rod",          (0.78, 0.80, 0.82), rough=0.30, metallic=0.85),
        "switch"      : make_mat("M_Switch",          (0.10, 0.10, 0.12), rough=0.60),
        "solder"      : make_mat("M_Solder",          (0.85, 0.84, 0.82), rough=0.20, metallic=0.70),
    }


# ─── FLOAT BODY ────────────────────────────────────────────────────────
def build_float(mats, c):
    ro = 140 * MM
    z_top, z_bot = 110 * MM, -110 * MM
    band_zt, band_zb = 30 * MM, -30 * MM
    chamfer = 18 * MM

    prof = [(40 * MM, z_bot), (ro - chamfer, z_bot)]
    N = 18
    cx, cz = ro - chamfer, z_bot + chamfer
    for i in range(N + 1):
        a = -math.pi / 2 + (math.pi / 2) * (i / N)
        prof.append((cx + chamfer * math.cos(a), cz + chamfer * math.sin(a)))
    prof.append((ro, band_zb))
    prof.append((ro - 6 * MM, band_zb))
    prof.append((ro - 6 * MM, band_zt))
    prof.append((ro, band_zt))
    prof.append((ro, z_top - chamfer))
    cx, cz = ro - chamfer, z_top - chamfer
    for i in range(N + 1):
        a = (math.pi / 2) * (i / N)
        prof.append((cx + chamfer * math.cos(a), cz + chamfer * math.sin(a)))
    prof.append((52 * MM, z_top))
    prof.append((52 * MM, z_top + 5 * MM))
    prof.append((40 * MM, z_top + 5 * MM))
    prof.append((40 * MM, z_top))
    prof.append((0, z_top))
    prof.append((0, z_bot))
    body = lathe_profile("Float.Body", prof, c)
    assign(body, mats["yellow"])

    band_prof = [
        (ro, band_zb + 1 * MM),
        (ro, band_zt - 1 * MM),
        (ro - 6 * MM, band_zt - 1 * MM),
        (ro - 6 * MM, band_zb + 1 * MM),
    ]
    band = lathe_profile("Float.HiVizBand", band_prof, c)
    assign(band, mats["orange"])

    trim = lathe_profile("Float.TopTrim", [
        (54 * MM, z_top + 5 * MM),
        (54 * MM, z_top + 12 * MM),
        (50 * MM, z_top + 12 * MM),
        (50 * MM, z_top + 5 * MM),
    ], c)
    assign(trim, mats["black_trim"])


# ─── SENSOR TOWER ──────────────────────────────────────────────────────
def build_tower(mats, c):
    tower_zb = 115 * MM
    tower_zt = 435 * MM
    tower_r = 50 * MM

    tower = lathe_profile("Tower.Body", [
        (tower_r, tower_zb),
        (tower_r, tower_zt),
        (0, tower_zt),
        (0, tower_zb),
    ], c, steps=96)
    assign(tower, mats["yellow"])

    for z in [tower_zb + 30 * MM, tower_zb + 200 * MM]:
        r = torus(f"Tower.Collar.z{int(z * 1000)}",
                  major_r=tower_r + 0.5 * MM, minor_r=4 * MM,
                  location=(0, 0, z), maj_seg=64, min_seg=10)
        link(r, c); assign(r, mats["black_trim"])

    hp = box("Tower.HatchPlate", 60 * MM, 2.5 * MM, 90 * MM,
             location=(0, tower_r + 1.25 * MM, 300 * MM))
    bv = hp.modifiers.new("Bevel", type="BEVEL")
    bv.width = 4 * MM; bv.segments = 6; bv.profile = 0.5
    bpy.context.view_layer.objects.active = hp
    bpy.ops.object.modifier_apply(modifier="Bevel")
    link(hp, c); assign(hp, mats["black_trim"])

    for i, (bx, bz) in enumerate([(-20 * MM, 38 * MM), (20 * MM, 38 * MM),
                                   (-20 * MM, -38 * MM), (20 * MM, -38 * MM)]):
        b = cyl(f"Tower.HatchBolt.{i}", 2 * MM, 3 * MM,
                location=(bx, tower_r + 2 * MM, 300 * MM + bz),
                verts=14, rot=(math.radians(90), 0, 0))
        link(b, c); assign(b, mats["metal_ss"])

    led_z = tower_zt - 18 * MM
    led = cyl("Tower.LEDRing", 51 * MM, 8 * MM, location=(0, 0, led_z), verts=96)
    bore = cyl("_led_bore", 47 * MM, 12 * MM, location=(0, 0, led_z), verts=64)
    mod = led.modifiers.new("Bore", type="BOOLEAN")
    mod.operation = "DIFFERENCE"; mod.object = bore
    bpy.context.view_layer.objects.active = led
    bpy.ops.object.modifier_apply(modifier="Bore")
    bpy.data.objects.remove(bore, do_unlink=True)
    link(led, c); assign(led, mats["led_amber"])


# ─── DOME TOP ──────────────────────────────────────────────────────────
def build_dome(mats, c):
    z_base = 435 * MM
    r_base = 55 * MM
    dome_h = 50 * MM
    N = 18
    prof = []
    for i in range(N + 1):
        a = (math.pi / 2) * (i / N)
        prof.append((r_base * math.cos(a), z_base + dome_h * math.sin(a)))
    prof.append((0, z_base + dome_h + 0.001))
    prof.append((0, z_base))
    dome = lathe_profile("DomeTop.Glass", prof, c)
    assign(dome, mats["dome_glass"])

    sp = cyl("DomeTop.SolarPanel", 45 * MM, 5 * MM,
             location=(0, 0, z_base + 4 * MM), verts=64)
    link(sp, c); assign(sp, mats["solar"])

    spire = cyl("DomeTop.AntennaSpire", 4 * MM, 90 * MM,
                location=(0, 0, z_base + dome_h + 45 * MM), verts=20)
    link(spire, c); assign(spire, mats["spire_clear"])

    wire = cyl("DomeTop.AntennaWire", 0.8 * MM, 88 * MM,
               location=(0, 0, z_base + dome_h + 45 * MM), verts=10)
    link(wire, c); assign(wire, mats["black_trim"])


# ─── TAIL KEEL + POD + ANCHOR EYE ──────────────────────────────────────
def build_tail(mats, c):
    keel_zt, keel_zb = -110 * MM, -330 * MM
    keel = lathe_profile("Tail.Keel", [
        (45 * MM, keel_zt),
        (40 * MM, keel_zt - 50 * MM),
        (32 * MM, keel_zt - 110 * MM),
        (28 * MM, keel_zt - 170 * MM),
        (28 * MM, keel_zb + 10 * MM),
        (28 * MM, keel_zb),
        (0, keel_zb),
        (0, keel_zt),
    ], c)
    assign(keel, mats["keel_dark"])

    pod = cyl("Tail.SensorPod", 32 * MM, 60 * MM,
              location=(0, 0, keel_zb - 30 * MM), verts=48)
    link(pod, c); assign(pod, mats["metal_dark"])

    eye = torus("Tail.AnchorEye", major_r=14 * MM, minor_r=3 * MM,
                location=(0, 0, keel_zb - 70 * MM), maj_seg=32, min_seg=12)
    eye.rotation_euler = (math.radians(90), 0, 0)
    link(eye, c); assign(eye, mats["metal_ss"])


# ─── PROBES ────────────────────────────────────────────────────────────
def build_probes(mats, c):
    pod_bottom_z = -390 * MM
    probes = [
        ("DS18B20",  -20 * MM, 70 * MM, "cable_red",  8 * MM,  45 * MM, "metal_ss"),
        ("pH",         0 * MM, 100 * MM, "cable_blue", 14 * MM, 75 * MM, "probe_ph"),
        ("Turbidity", 20 * MM, 70 * MM, "cable_grey", 18 * MM, 60 * MM, "probe_turb"),
    ]
    for name, dx, clen, cm, bd, bl, bm_mat in probes:
        cz = pod_bottom_z - clen / 2
        cable = cyl(f"Probe.{name}.Cable", 1.8 * MM, clen, location=(dx, 0, cz), verts=12)
        link(cable, c); assign(cable, mats[cm])
        bz = pod_bottom_z - clen - bl / 2
        pb = cyl(f"Probe.{name}", bd / 2, bl, location=(dx, 0, bz), verts=24)
        link(pb, c); assign(pb, mats[bm_mat])


# ─── ELECTRONICS ───────────────────────────────────────────────────────
def build_electronics(mats, c):
    SHELF_A_Z = 350 * MM
    SHELF_B_Z = 165 * MM
    shelf_t = 3 * MM
    inner_r = 42 * MM

    for nm, z in [("Elec.ShelfA", SHELF_A_Z), ("Elec.ShelfB", SHELF_B_Z)]:
        s = cyl(nm, inner_r, shelf_t, location=(0, 0, z), verts=48)
        link(s, c); assign(s, mats["acrylic"])

    rod_circle = inner_r - 6 * MM
    rod_h = SHELF_A_Z - SHELF_B_Z + shelf_t * 2
    for i in range(4):
        ang = math.pi / 4 + i * math.pi / 2
        rod = cyl(f"Elec.Rod{i}", 1.5 * MM, rod_h,
                  location=(rod_circle * math.cos(ang),
                            rod_circle * math.sin(ang),
                            (SHELF_A_Z + SHELF_B_Z) / 2),
                  verts=8)
        link(rod, c); assign(rod, mats["rod"])

    esp = box("Elec.ESP32S3", 55 * MM, 22 * MM, 8 * MM,
              location=(-8 * MM, 0, SHELF_A_Z + shelf_t / 2 + 4 * MM))
    link(esp, c); assign(esp, mats["esp32"])
    usb = box("Elec.USBC", 8 * MM, 6 * MM, 3 * MM,
              location=(-40 * MM, 0, SHELF_A_Z + shelf_t / 2 + 4 * MM))
    link(usb, c); assign(usb, mats["solder"])
    ads = box("Elec.ADS1115", 18 * MM, 13 * MM, 4 * MM,
              location=(24 * MM, -8 * MM, SHELF_A_Z + shelf_t / 2 + 2 * MM))
    link(ads, c); assign(ads, mats["pcb_blue"])
    rtc = box("Elec.RTC", 20 * MM, 13 * MM, 5 * MM,
              location=(24 * MM, 9 * MM, SHELF_A_Z + shelf_t / 2 + 2.5 * MM))
    link(rtc, c); assign(rtc, mats["pcb_blue"])
    ph_amp = box("Elec.pHAmp", 26 * MM, 20 * MM, 6 * MM,
                 location=(-28 * MM, 14 * MM, SHELF_A_Z + shelf_t / 2 + 3 * MM))
    link(ph_amp, c); assign(ph_amp, mats["pcb_blue"])
    turb_amp = box("Elec.TurbAmp", 26 * MM, 15 * MM, 5 * MM,
                   location=(-28 * MM, -14 * MM, SHELF_A_Z + shelf_t / 2 + 2.5 * MM))
    link(turb_amp, c); assign(turb_amp, mats["pcb_red"])

    holder = box("Elec.BattHolder", 70 * MM, 20 * MM, 22 * MM,
                 location=(0, 0, SHELF_B_Z + shelf_t / 2 + 11 * MM))
    link(holder, c); assign(holder, mats["holder"])
    for i, x in enumerate([-14 * MM, 14 * MM]):
        cell = cyl(f"Elec.Cell18650.{i}", 9 * MM, 65 * MM,
                   location=(x, 0, SHELF_B_Z + shelf_t / 2 + 10 * MM), verts=32)
        cell.rotation_euler = (math.radians(90), 0, 0)
        link(cell, c); assign(cell, mats["battery"])
    mppt = box("Elec.MPPT", 30 * MM, 17 * MM, 6 * MM,
               location=(0, 28 * MM, SHELF_B_Z + shelf_t / 2 + 3 * MM))
    link(mppt, c); assign(mppt, mats["pcb_blue"])
    bms = box("Elec.BMS", 26 * MM, 13 * MM, 4 * MM,
              location=(0, -28 * MM, SHELF_B_Z + shelf_t / 2 + 2 * MM))
    link(bms, c); assign(bms, mats["pcb_red"])
    sw = box("Elec.PowerSwitch", 14 * MM, 10 * MM, 8 * MM,
             location=(0, -38 * MM, SHELF_A_Z - 60 * MM))
    sw.rotation_euler = (math.radians(90), 0, 0)
    link(sw, c); assign(sw, mats["switch"])


# ─── CAMERAS + LIGHTING + RENDER ───────────────────────────────────────
def setup_cameras():
    bpy.ops.object.camera_add(location=(1.10, -1.50, 0.20),
                              rotation=(math.radians(82), 0, math.radians(35)))
    hero = bpy.context.active_object; hero.name = "Camera.Hero"; hero.data.lens = 65

    bpy.ops.object.camera_add(location=(0, -2.0, 0.05),
                              rotation=(math.radians(90), 0, 0))
    sec = bpy.context.active_object; sec.name = "Camera.Section"
    sec.data.type = "ORTHO"; sec.data.ortho_scale = 1.05

    bpy.ops.object.camera_add(location=(1.05, -1.10, 0.30),
                              rotation=(math.radians(80), 0, math.radians(48)))
    cut = bpy.context.active_object; cut.name = "Camera.Cutaway"; cut.data.lens = 60

    bpy.context.scene.camera = hero


def setup_lighting():
    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.92, 0.90, 0.85, 1.0)
    bg.inputs["Strength"].default_value = 1.1

    bpy.ops.object.light_add(type="AREA", location=(1.5, -1.0, 1.8))
    key = bpy.context.active_object; key.name = "Key.Area"
    key.data.energy = 300; key.data.size = 0.8
    key.rotation_euler = (math.radians(60), 0, math.radians(45))

    bpy.ops.mesh.primitive_plane_add(size=3.5, location=(0, 0, -0.42))
    g = bpy.context.active_object; g.name = "Render.Ground"
    gm = bpy.data.materials.new("M_Ground"); gm.use_nodes = True
    gb = gm.node_tree.nodes["Principled BSDF"]
    gb.inputs["Base Color"].default_value = (0.92, 0.90, 0.85, 1.0)
    gb.inputs["Roughness"].default_value = 0.9
    g.data.materials.append(gm)


def setup_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 256
    scene.cycles.use_denoising = True
    try:
        scene.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception:
        pass
    scene.render.resolution_x = 1400
    scene.render.resolution_y = 1750
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.cycles.transparent_max_bounces = 16
    scene.cycles.transmission_bounces = 16
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "MILLIMETERS"


# ─── BUILD ─────────────────────────────────────────────────────────────
def build():
    clear_scene()
    mats = build_materials()

    root    = col("AquaNet_Buoy")
    c_float = col("Float", parent=root)
    c_tower = col("Tower", parent=root)
    c_dome  = col("DomeTop", parent=root)
    c_tail  = col("Tail", parent=root)
    c_sens  = col("Sensors", parent=root)
    c_elec  = col("Electronics", parent=root)

    build_float(mats, c_float)
    build_tower(mats, c_tower)
    build_dome(mats, c_dome)
    build_tail(mats, c_tail)
    build_probes(mats, c_sens)
    build_electronics(mats, c_elec)

    setup_cameras()
    setup_lighting()
    setup_render()

    # Optional GLB export for the web:
    # bpy.ops.export_scene.gltf(filepath="/tmp/aquanet-buoy.glb", export_format="GLB")

    print("AquaNet buoy build complete.")
    print(f"Objects: {len(bpy.data.objects)}  ·  Materials: {len(bpy.data.materials)}")


if __name__ == "__main__":
    build()
