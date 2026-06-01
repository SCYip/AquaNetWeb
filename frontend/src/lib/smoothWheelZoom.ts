import L from 'leaflet'

/* ────────────────────────────────────────────────────────────────────────────
 * SmoothWheelZoom — continuous, cursor-centred wheel/trackpad zoom for Leaflet.
 *
 * Leaflet's built-in scroll-wheel zoom snaps to discrete zoom levels (it feels
 * "一段一段的"). This handler instead eases the map toward a fractional goal
 * zoom every animation frame, so zooming feels smooth and continuous — like
 * Google Maps / a native trackpad pinch.
 *
 * Importing this module registers the handler globally (enabled by default).
 * On the map, set `scrollWheelZoom={false}` so the native stepped zoom is off.
 *
 * Adapted from the widely-used Leaflet.SmoothWheelZoom handler (MIT).
 * ──────────────────────────────────────────────────────────────────────────── */

/* eslint-disable @typescript-eslint/no-explicit-any */

const SmoothWheelZoom = (L.Handler as any).extend({
  addHooks(this: any) {
    L.DomEvent.on(this._map._container, 'wheel', this._onWheelScroll, this)
  },

  removeHooks(this: any) {
    L.DomEvent.off(this._map._container, 'wheel', this._onWheelScroll, this)
  },

  _onWheelScroll(this: any, e: WheelEvent) {
    if (!this._isWheeling) this._onWheelStart(e)
    this._onWheeling(e)
  },

  _onWheelStart(this: any, e: WheelEvent) {
    const map = this._map
    this._isWheeling = true
    this._wheelMousePosition = map.mouseEventToContainerPoint(e)
    this._centerPoint = map.getSize().divideBy(2)
    this._startLatLng = map.containerPointToLatLng(this._centerPoint)
    this._wheelStartLatLng = map.containerPointToLatLng(this._wheelMousePosition)
    this._startZoom = map.getZoom()
    this._moved = false
    this._zooming = true
    map.stop()
    this._goalZoom = map.getZoom()
    this._prevCenter = map.getCenter()
    this._prevZoom = map.getZoom()
    this._zoomAnimationId = requestAnimationFrame(this._updateWheelZoom.bind(this))
  },

  _onWheeling(this: any, e: WheelEvent) {
    const map = this._map
    const sensitivity = map.options.smoothSensitivity || 1
    this._goalZoom = this._goalZoom - (L.DomEvent as any).getWheelDelta(e) * 0.003 * sensitivity
    if (this._goalZoom < map.getMinZoom() || this._goalZoom > map.getMaxZoom()) {
      this._goalZoom = map._limitZoom(this._goalZoom)
    }
    this._wheelMousePosition = map.mouseEventToContainerPoint(e)

    clearTimeout(this._timeoutId)
    this._timeoutId = setTimeout(this._onWheelEnd.bind(this), 200)

    L.DomEvent.preventDefault(e)
    L.DomEvent.stopPropagation(e)
  },

  _onWheelEnd(this: any) {
    this._isWheeling = false
    cancelAnimationFrame(this._zoomAnimationId)
    this._map.stop()
  },

  _updateWheelZoom(this: any) {
    const map = this._map
    if (!map.getCenter().equals(this._prevCenter) || map.getZoom() !== this._prevZoom) return

    this._zoom = map.getZoom() + (this._goalZoom - map.getZoom()) * 0.3
    this._zoom = Math.floor(this._zoom * 100) / 100

    const delta = this._wheelMousePosition.subtract(this._centerPoint)
    if (delta.x === 0 && delta.y === 0) return

    const center = map.unproject(
      map.project(this._wheelStartLatLng, this._zoom).subtract(delta),
      this._zoom,
    )
    map.setView(center, this._zoom, { animate: false })

    this._prevCenter = map.getCenter()
    this._prevZoom = map.getZoom()
    this._zoomAnimationId = requestAnimationFrame(this._updateWheelZoom.bind(this))
  },
})

;(L.Map as any).mergeOptions({ smoothWheelZoom: true, smoothSensitivity: 1 })
;(L.Map as any).addInitHook('addHandler', 'smoothWheelZoom', SmoothWheelZoom)

export {}
