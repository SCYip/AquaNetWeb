"""
AquaNet 水眸 · Buoy v1 — Blender model builder (redesigned shell)
==================================================================

Builds a designed spar buoy — not a piece of plumbing. Vocabulary:

  - Clear acrylic dome on top with the solar panel + antenna inside
  - Sea-cyan brand stripe + amber LED status window below the dome
  - Tapered HDPE-style body with a subtle waist
  - Side service hatch with 4 bolts + a finger-recess grip
  - Two recessed rubber lift grips on opposite sides of the body
  - Contoured foam collar (rounded torus profile, not a flat slab)
  - Hi-viz orange band wrapped around the foam at the waterline
  - Tapered dark tail keel with a sensor pod at the bottom
  - Flush stainless anchor eye + three probes (temp / pH / turbidity)

Internal:
  - Two laser-cut acrylic shelves stacked on 4× M3 threaded rods
  - Shelf A (top): ESP32-S3, ADS1115 ADC, DS3231 RTC, pH amp, turbidity amp
  - Shelf B (bottom): 2× 18650 battery holder, CN3791 MPPT, BMS, switch

Run this in Blender's Scripting workspace, or:
    blender --background --python docs/hardware/buoy-v1.blender.py
"""

import bpy
import bmesh
import math

MM = 0.001  # Blender uses metres; everything below is in millimetres scaled by MM.


# ─── HELPERS ───────────────────────────────────────────────────────────
def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for col_ in list(bpy.data.collections):
        if col_.name != "Collection":
            bpy.data.collections.remove(col_)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)
    for cam in list(bpy.data.cameras):
        bpy.data.cameras.remove(cam)
    for light in list(bpy.data.lights):
        bpy.data.lights.remove(light)


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


def make_mat(name, color, rough=0.55, metallic=0.0, alpha=1.0, clearcoat=0.0):
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
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    return m


def assign(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def lathe_profile(name, prof, target_collection, steps=128):
    """Build a revolved solid from a (x, z) profile polyline."""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bm = bmesh.new()
    verts = [bm.verts.new((x, 0, z)) for (x, z) in prof]
    bm.faces.new(verts)
    bm.to_mesh(mesh)
    bm.free()
    link(obj, target_collection)
    scr = obj.modifiers.new("Lathe", type="SCREW")
    scr.axis = "Z"
    scr.angle = math.radians(360)
    scr.steps = steps
    scr.render_steps = steps
    scr.use_smooth_shade = True
    scr.use_merge_vertices = True
    scr.iterations = 1
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    return obj


def cyl(name, r, h, location=(0, 0, 0), verts=32, rot=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=location)
    o = bpy.context.active_object
    o.name = name
    if rot:
        o.rotation_euler = rot
    return o


def box(name, x, y, z, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    o = bpy.context.active_object
    o.name = name
    o.scale = (x / 2, y / 2, z / 2)
    bpy.ops.object.transform_apply(scale=True)
    return o


def torus(name, major_r, minor_r, location=(0, 0, 0), maj_seg=64, min_seg=12):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_r, minor_radius=minor_r,
        location=location, major_segments=maj_seg, minor_segments=min_seg,
    )
    o = bpy.context.active_object
    o.name = name
    return o


# ─── MATERIALS ─────────────────────────────────────────────────────────
def build_materials():
    return {
        "hull_white"  : make_mat("M_Hull_White",   (0.94, 0.93, 0.89), rough=0.55, clearcoat=0.15),
        "hatch_plate" : make_mat("M_Hatch_Plate",  (0.86, 0.85, 0.81), rough=0.50, clearcoat=0.15),
        "grip_rubber" : make_mat("M_Grip_Rubber",  (0.06, 0.06, 0.07), rough=0.85),
        "led_window"  : make_mat("M_LED_Window",   (0.32, 0.78, 0.78), rough=0.25, alpha=0.55),
        "brand_band"  : make_mat("M_Brand_Stripe", (0.18, 0.56, 0.49), rough=0.45, clearcoat=0.20),
        "dome_glass"  : make_mat("M_Dome_Glass",   (0.92, 0.95, 0.97), rough=0.05, alpha=0.30, clearcoat=0.60),
        "solar_navy"  : make_mat("M_Solar_Navy",   (0.05, 0.10, 0.22), rough=0.18, metallic=0.55, clearcoat=0.40),
        "spire_clear" : make_mat("M_Spire_Clear",  (0.94, 0.96, 0.98), rough=0.04, alpha=0.20),
        "ant_wire"    : make_mat("M_Antenna_Wire", (0.06, 0.06, 0.07), rough=0.55),
        "foam_sand"   : make_mat("M_Foam_Sand",    (0.86, 0.78, 0.58), rough=0.95),
        "hiviz"       : make_mat("M_Hiviz_Orange", (0.96, 0.42, 0.10), rough=0.55, clearcoat=0.25),
        "tail_dark"   : make_mat("M_Tail_Dark",    (0.14, 0.16, 0.19), rough=0.55, clearcoat=0.20),
        "pod_dark"    : make_mat("M_Pod_Dark",     (0.10, 0.11, 0.13), rough=0.50, clearcoat=0.30),
        "metal_ss"    : make_mat("M_Metal_SS",     (0.78, 0.80, 0.82), rough=0.25, metallic=0.90),
        "probe_ss"    : make_mat("M_Probe_SS",     (0.78, 0.80, 0.82), rough=0.25, metallic=0.90),
        "probe_ph"    : make_mat("M_Probe_pH",     (0.18, 0.42, 0.50), rough=0.40),
        "probe_turb"  : make_mat("M_Probe_Turb",   (0.08, 0.10, 0.12), rough=0.45),
        "cable_red"   : make_mat("M_Cable_Red",    (0.58, 0.18, 0.16), rough=0.55),
        "cable_blue"  : make_mat("M_Cable_Blue",   (0.18, 0.32, 0.45), rough=0.55),
        "cable_grey"  : make_mat("M_Cable_Grey",   (0.40, 0.42, 0.46), rough=0.55),
        "acrylic"     : make_mat("M_Acrylic_Tinted", (0.78, 0.92, 0.96), rough=0.10, alpha=0.40, clearcoat=0.40),
        "esp32"       : make_mat("M_ESP32",        (0.10, 0.62, 0.50), rough=0.45),
        "pcb_blue"    : make_mat("M_PCB_Blue",     (0.10, 0.32, 0.50), rough=0.50),
        "pcb_red"     : make_mat("M_PCB_Red",      (0.62, 0.22, 0.12), rough=0.50),
        "battery"     : make_mat("M_Battery",      (0.42, 0.50, 0.60), rough=0.35, metallic=0.55),
        "holder"      : make_mat("M_BattHolder",   (0.10, 0.10, 0.12), rough=0.85),
        "rod"         : make_mat("M_M3_Rod",       (0.78, 0.80, 0.82), rough=0.30, metallic=0.85),
        "switch"      : make_mat("M_Switch",       (0.10, 0.10, 0.12), rough=0.60),
        "solder"      : make_mat("M_Solder",       (0.85, 0.84, 0.82), rough=0.20, metallic=0.70),
    }


# ─── BODY HULL ─────────────────────────────────────────────────────────
def build_body(mats, c):
    prof = [
        (55 * MM,   0 * MM),
        (55 * MM,  20 * MM),
        (53 * MM,  60 * MM),
        (51 * MM, 110 * MM),
        (51 * MM, 160 * MM),
        (51 * MM, 210 * MM),
        (53 * MM, 260 * MM),
        (55 * MM, 300 * MM),
        (55 * MM, 320 * MM),
        ( 0 * MM, 320 * MM),
        ( 0 * MM,   0 * MM),
    ]
    body = lathe_profile("Hull.Body", prof, c)
    assign(body, mats["hull_white"])

    bs = torus("Hull.BrandStripe", major_r=55.5 * MM, minor_r=2 * MM,
               location=(0, 0, 290 * MM), maj_seg=96, min_seg=8)
    link(bs, c)
    assign(bs, mats["brand_band"])

    ring = cyl("Hull.LEDWindow", 55 * MM, 6 * MM, location=(0, 0, 305 * MM), verts=96)
    bore = cyl("_led_bore", 51 * MM, 10 * MM, location=(0, 0, 305 * MM), verts=64)
    mod = ring.modifiers.new("Bore", type="BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = bore
    bpy.context.view_layer.objects.active = ring
    bpy.ops.object.modifier_apply(modifier="Bore")
    bpy.data.objects.remove(bore, do_unlink=True)
    link(ring, c)
    assign(ring, mats["led_window"])

    hp = box("Hull.HatchPlate", 70 * MM, 2.5 * MM, 90 * MM,
             location=(0, 56.25 * MM, 200 * MM))
    bv = hp.modifiers.new("Bevel", type="BEVEL")
    bv.width = 4 * MM; bv.segments = 6; bv.profile = 0.5
    bpy.context.view_layer.objects.active = hp
    bpy.ops.object.modifier_apply(modifier="Bevel")
    link(hp, c); assign(hp, mats["hatch_plate"])

    for i, (bx, bz_off) in enumerate([(-22 * MM,  38 * MM), ( 22 * MM,  38 * MM),
                                       (-22 * MM, -38 * MM), ( 22 * MM, -38 * MM)]):
        b = cyl(f"Hull.HatchBolt.{i}", 2 * MM, 3 * MM,
                location=(bx, 57.5 * MM, 200 * MM + bz_off),
                verts=12, rot=(math.radians(90), 0, 0))
        link(b, c); assign(b, mats["metal_ss"])

    fr = torus("Hull.HatchGrip", major_r=8 * MM, minor_r=1.5 * MM,
               location=(0, 58 * MM, 200 * MM), maj_seg=24, min_seg=10)
    fr.rotation_euler = (math.radians(90), 0, 0)
    link(fr, c); assign(fr, mats["grip_rubber"])

    for i, ang in enumerate([math.radians(90), math.radians(270)]):
        cx, cy = 55 * MM * math.cos(ang), 55 * MM * math.sin(ang)
        g = box(f"Hull.LiftGrip.{i}", 50 * MM, 4 * MM, 14 * MM,
                location=(cx * 0.95, cy * 0.95, 140 * MM))
        g.rotation_euler = (0, 0, ang - math.radians(90))
        bv = g.modifiers.new("Bevel", type="BEVEL"); bv.width = 3 * MM; bv.segments = 4
        bpy.context.view_layer.objects.active = g
        bpy.ops.object.modifier_apply(modifier="Bevel")
        link(g, c); assign(g, mats["grip_rubber"])


# ─── DOME TOP ──────────────────────────────────────────────────────────
def build_dome(mats, c):
    z0 = 320 * MM; dome_h = 60 * MM; r_base = 55 * MM
    N = 18; prof = []
    for i in range(N + 1):
        a = (math.pi / 2) * (i / N)
        prof.append((r_base * math.cos(a) * 1.10, z0 + dome_h * math.sin(a)))
    prof.append((0, z0 + dome_h + 0.001))
    prof.append((0, z0))
    dome = lathe_profile("DomeTop.Glass", prof, c)
    assign(dome, mats["dome_glass"])

    sp = cyl("DomeTop.SolarPanel", 46 * MM, 4 * MM, location=(0, 0, 322 * MM), verts=64)
    link(sp, c); assign(sp, mats["solar_navy"])

    spire = cyl("DomeTop.AntennaSpire", 5 * MM, 80 * MM, location=(0, 0, 420 * MM), verts=24)
    link(spire, c); assign(spire, mats["spire_clear"])

    wire = cyl("DomeTop.AntennaWire", 1 * MM, 75 * MM, location=(0, 0, 420 * MM), verts=12)
    link(wire, c); assign(wire, mats["ant_wire"])


# ─── FOAM COLLAR ───────────────────────────────────────────────────────
def build_foam(mats, c):
    ro, ri = 115 * MM, 55 * MM
    z_top, z_bot = 45 * MM, -65 * MM
    r_c = 25 * MM
    prof = [(ri, z_top), (ro - r_c, z_top)]
    N = 20
    cx, cz = ro - r_c, z_top - r_c
    for i in range(1, N + 1):
        a = math.pi / 2 * (1 - i / N)
        prof.append((cx + r_c * math.cos(a), cz + r_c * math.sin(a)))
    prof.append((ro, z_bot + r_c))
    cx, cz = ro - r_c, z_bot + r_c
    for i in range(1, N + 1):
        a = -math.pi / 2 * (i / N)
        prof.append((cx + r_c * math.cos(a), cz + r_c * math.sin(a)))
    prof.append((ri, z_bot))
    foam = lathe_profile("Foam.Body", prof, c)
    assign(foam, mats["foam_sand"])

    band = cyl("Foam.HiVizBand", 116 * MM, 22 * MM, location=(0, 0, 0), verts=96)
    bore = cyl("_band_bore", 56 * MM, 30 * MM, location=(0, 0, 0), verts=64)
    mod = band.modifiers.new("Bore", type="BOOLEAN"); mod.operation = "DIFFERENCE"; mod.object = bore
    bpy.context.view_layer.objects.active = band; bpy.ops.object.modifier_apply(modifier="Bore")
    bpy.data.objects.remove(bore, do_unlink=True)
    link(band, c); assign(band, mats["hiviz"])


# ─── TAIL KEEL + SENSOR POD + ANCHOR EYE ──────────────────────────────
def build_tail(mats, c):
    prof = [
        (55 * MM,  -10 * MM), (55 * MM,  -30 * MM), (50 * MM,  -80 * MM),
        (40 * MM, -150 * MM), (32 * MM, -220 * MM), (28 * MM, -260 * MM),
        (28 * MM, -290 * MM), ( 0 * MM, -290 * MM), ( 0 * MM,  -10 * MM),
    ]
    keel = lathe_profile("Tail.Keel", prof, c)
    assign(keel, mats["tail_dark"])

    pod = cyl("Tail.SensorPod", 28 * MM, 50 * MM, location=(0, 0, -315 * MM), verts=48)
    link(pod, c); assign(pod, mats["pod_dark"])

    eye = torus("Tail.AnchorEye", major_r=12 * MM, minor_r=2.5 * MM,
                location=(0, 0, -345 * MM), maj_seg=32, min_seg=12)
    eye.rotation_euler = (math.radians(90), 0, 0)
    link(eye, c); assign(eye, mats["metal_ss"])


# ─── SENSOR PROBES ─────────────────────────────────────────────────────
def build_probes(mats, c):
    pod_bottom_z = -340 * MM
    probes = [
        ("DS18B20_Temp", -18 * MM, 60 * MM, "cable_red",   8 * MM,  40 * MM, "probe_ss"),
        ("pH_Probe",       0 * MM, 90 * MM, "cable_blue", 14 * MM,  70 * MM, "probe_ph"),
        ("Turbidity",     18 * MM, 60 * MM, "cable_grey", 18 * MM,  55 * MM, "probe_turb"),
    ]
    for name, dx, clen, cmat, bdia, blen, bmat in probes:
        cz = pod_bottom_z - clen / 2
        cable = cyl(f"Probe.{name}.Cable", 2 * MM, clen, location=(dx, 0, cz), verts=12)
        link(cable, c); assign(cable, mats[cmat])
        bz = pod_bottom_z - clen - blen / 2
        body = cyl(f"Probe.{name}", bdia / 2, blen, location=(dx, 0, bz), verts=24)
        link(body, c); assign(body, mats[bmat])


# ─── INTERNAL ELECTRONICS ──────────────────────────────────────────────
def build_electronics(mats, c):
    SHELF_A_Z = 240 * MM
    SHELF_B_Z =  60 * MM
    shelf_t = 3 * MM
    inner_r = 48 * MM

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

    esp = box("Elec.ESP32S3", 60 * MM, 25 * MM, 8 * MM,
              location=(-10 * MM, 0, SHELF_A_Z + shelf_t / 2 + 4 * MM))
    link(esp, c); assign(esp, mats["esp32"])
    usb = box("Elec.USBC", 8 * MM, 6 * MM, 3 * MM,
              location=(-45 * MM, 0, SHELF_A_Z + shelf_t / 2 + 4 * MM))
    link(usb, c); assign(usb, mats["solder"])
    ads = box("Elec.ADS1115", 20 * MM, 14 * MM, 4 * MM,
              location=(28 * MM, -8 * MM, SHELF_A_Z + shelf_t / 2 + 2 * MM))
    link(ads, c); assign(ads, mats["pcb_blue"])
    rtc = box("Elec.RTC", 22 * MM, 14 * MM, 5 * MM,
              location=(28 * MM, 10 * MM, SHELF_A_Z + shelf_t / 2 + 2.5 * MM))
    link(rtc, c); assign(rtc, mats["pcb_blue"])
    ph_amp = box("Elec.pHAmp", 28 * MM, 22 * MM, 6 * MM,
                 location=(-32 * MM, 16 * MM, SHELF_A_Z + shelf_t / 2 + 3 * MM))
    link(ph_amp, c); assign(ph_amp, mats["pcb_blue"])
    turb_amp = box("Elec.TurbAmp", 28 * MM, 16 * MM, 5 * MM,
                   location=(-32 * MM, -16 * MM, SHELF_A_Z + shelf_t / 2 + 2.5 * MM))
    link(turb_amp, c); assign(turb_amp, mats["pcb_red"])

    holder = box("Elec.BattHolder", 75 * MM, 22 * MM, 22 * MM,
                 location=(0, 0, SHELF_B_Z + shelf_t / 2 + 11 * MM))
    link(holder, c); assign(holder, mats["holder"])
    for i, x in enumerate([-15 * MM, 15 * MM]):
        cell = cyl(f"Elec.Cell18650.{i}", 9 * MM, 65 * MM,
                   location=(x, 0, SHELF_B_Z + shelf_t / 2 + 9 * MM + 1 * MM),
                   verts=32)
        cell.rotation_euler = (math.radians(90), 0, 0)
        link(cell, c); assign(cell, mats["battery"])
    mppt = box("Elec.MPPT", 32 * MM, 18 * MM, 6 * MM,
               location=(0, 32 * MM, SHELF_B_Z + shelf_t / 2 + 3 * MM))
    link(mppt, c); assign(mppt, mats["pcb_blue"])
    bms = box("Elec.BMS", 28 * MM, 14 * MM, 4 * MM,
              location=(0, -32 * MM, SHELF_B_Z + shelf_t / 2 + 2 * MM))
    link(bms, c); assign(bms, mats["pcb_red"])
    sw = box("Elec.PowerSwitch", 14 * MM, 10 * MM, 8 * MM,
             location=(0, -42 * MM, SHELF_A_Z - 40 * MM))
    sw.rotation_euler = (math.radians(90), 0, 0)
    link(sw, c); assign(sw, mats["switch"])


# ─── CAMERAS + LIGHTING ────────────────────────────────────────────────
def setup_cameras():
    bpy.ops.object.camera_add(location=(0.78, -1.05, 0.32),
                              rotation=(math.radians(82), 0, math.radians(35)))
    hero = bpy.context.active_object; hero.name = "Camera.Hero"; hero.data.lens = 55

    bpy.ops.object.camera_add(location=(0, -1.6, 0.08),
                              rotation=(math.radians(90), 0, 0))
    sec = bpy.context.active_object; sec.name = "Camera.Section"
    sec.data.type = "ORTHO"; sec.data.ortho_scale = 0.90

    bpy.ops.object.camera_add(location=(0.85, -1.20, 0.30),
                              rotation=(math.radians(80), 0, math.radians(33)))
    cut = bpy.context.active_object; cut.name = "Camera.Cutaway"; cut.data.lens = 50

    bpy.context.scene.camera = hero


def setup_lighting():
    bpy.ops.object.light_add(type="SUN", location=(2, -1.5, 3))
    sun = bpy.context.active_object; sun.name = "Key.Sun"
    sun.data.energy = 3.5; sun.data.angle = math.radians(6)
    sun.rotation_euler = (math.radians(50), math.radians(-12), math.radians(20))

    bpy.ops.object.light_add(type="AREA", location=(-1.4, -0.6, 0.6))
    af = bpy.context.active_object; af.name = "Fill.Area"
    af.data.energy = 300; af.data.size = 1.4
    af.rotation_euler = (math.radians(75), 0, math.radians(-60))

    bpy.ops.object.light_add(type="AREA", location=(0.6, 1.4, 0.7))
    ar = bpy.context.active_object; ar.name = "Rim.Area"
    ar.data.energy = 180; ar.data.size = 1.0
    ar.rotation_euler = (math.radians(95), 0, math.radians(160))

    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.96, 0.94, 0.90, 1.0)
    bg.inputs["Strength"].default_value = 0.8

    bpy.ops.mesh.primitive_plane_add(size=3.0, location=(0, 0, -0.36))
    g = bpy.context.active_object; g.name = "Render.Ground"
    gm = bpy.data.materials.new("M_Ground"); gm.use_nodes = True
    gb = gm.node_tree.nodes["Principled BSDF"]
    gb.inputs["Base Color"].default_value = (0.94, 0.92, 0.87, 1.0)
    gb.inputs["Roughness"].default_value = 0.9
    g.data.materials.append(gm)


def setup_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 128
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1400
    scene.render.resolution_y = 1750
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "MILLIMETERS"


# ─── BUILD ─────────────────────────────────────────────────────────────
def build():
    clear_scene()
    mats = build_materials()

    root = col("AquaNet_Buoy")
    c_shell = col("Shell", parent=root)
    c_dome = col("DomeTop", parent=root)
    c_foam = col("Foam", parent=root)
    c_tail = col("Tail", parent=root)
    c_sens = col("Sensors", parent=root)
    c_elec = col("Electronics", parent=root)

    build_body(mats, c_shell)
    build_dome(mats, c_dome)
    build_foam(mats, c_foam)
    build_tail(mats, c_tail)
    build_probes(mats, c_sens)
    build_electronics(mats, c_elec)

    setup_cameras()
    setup_lighting()
    setup_render()

    # Optional: uncomment to export GLB for the web
    # bpy.ops.export_scene.gltf(filepath="/tmp/aquanet-buoy.glb", export_format="GLB")

    print("AquaNet buoy build complete.")
    print(f"Objects: {len(bpy.data.objects)}  ·  Materials: {len(bpy.data.materials)}")


if __name__ == "__main__":
    build()
