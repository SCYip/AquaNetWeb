import L from 'leaflet'

/**
 * SmoothWheelZoom — momentum-based wheel zoom for Leaflet.
 *
 * Replaces Leaflet's discrete `scrollWheelZoom` (which jumps a full level per
 * tick) with a continuous zoom that follows the cursor and decays smoothly.
 * Feels closer to Mapbox / Google Maps panning.
 *
 * Use:
 *   import './lib/smoothWheelZoom'
 *   <MapContainer scrollWheelZoom={false} smoothWheelZoom smoothSensitivity={1}>
 */

declare module 'leaflet' {
  interface MapOptions {
    smoothWheelZoom?: boolean | 'center'
    smoothSensitivity?: number
  }
}

interface ZoomState {
  _map: LeafletMapInternal
  _isWheeling: boolean
  _wheelMousePosition: L.Point
  _centerPoint: L.Point
  _startLatLng: L.LatLng
  _wheelStartLatLng: L.LatLng
  _startZoom: number
  _moved: boolean
  _zooming: boolean
  _goalZoom: number
  _prevCenter: L.LatLng
  _prevZoom: number
  _zoomAnimationId: number
  _timer: number
  _center: L.LatLng
  _onWheelStart(e: WheelEvent): void
  _onWheeling(e: WheelEvent): void
  _onWheelEnd(): void
  _updateWheelZoom(): void
}

interface LeafletMapInternal extends L.Map {
  _stop(): void
  _panAnim?: { stop(): void }
  _moveStart(opts1: boolean, opts2?: boolean): void
  _moveEnd(animated: boolean): void
  _move(center: L.LatLng, zoom: number): void
}

const Handler = (L.Handler as unknown as { extend: (proto: object) => typeof L.Handler }).extend({
  addHooks(this: { _map: L.Map; _onWheelScroll: (e: WheelEvent) => void }) {
    L.DomEvent.on(this._map.getContainer(), 'wheel', this._onWheelScroll, this)
  },

  removeHooks(this: { _map: L.Map; _onWheelScroll: (e: WheelEvent) => void }) {
    L.DomEvent.off(this._map.getContainer(), 'wheel', this._onWheelScroll, this)
  },

  _onWheelScroll(this: ZoomState, e: WheelEvent) {
    if (!this._isWheeling) {
      this._onWheelStart(e)
    }
    this._onWheeling(e)
  },

  _onWheelStart(this: ZoomState, e: WheelEvent) {
    const map = this._map
    this._isWheeling = true
    this._wheelMousePosition = map.mouseEventToContainerPoint(e)
    this._centerPoint = map.getSize().divideBy(2) as L.Point
    this._startLatLng = map.containerPointToLatLng(this._centerPoint)
    this._wheelStartLatLng = map.containerPointToLatLng(this._wheelMousePosition)
    this._startZoom = map.getZoom()
    this._moved = false
    this._zooming = true

    map._stop()
    if (map._panAnim) map._panAnim.stop()

    this._goalZoom = map.getZoom()
    this._prevCenter = map.getCenter()
    this._prevZoom = map.getZoom()

    this._zoomAnimationId = requestAnimationFrame(() => this._updateWheelZoom())
  },

  _onWheeling(this: ZoomState, e: WheelEvent) {
    const map = this._map
    const sensitivity = (map.options.smoothSensitivity ?? 1) as number

    this._goalZoom = this._goalZoom + L.DomEvent.getWheelDelta(e) * 0.003 * sensitivity
    if (this._goalZoom < map.getMinZoom() || this._goalZoom > map.getMaxZoom()) {
      this._goalZoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), this._goalZoom))
    }
    this._wheelMousePosition = map.mouseEventToContainerPoint(e)

    if (this._timer) clearTimeout(this._timer)
    this._timer = window.setTimeout(() => this._onWheelEnd(), 200)

    L.DomEvent.preventDefault(e)
    L.DomEvent.stopPropagation(e)
  },

  _onWheelEnd(this: ZoomState) {
    this._isWheeling = false
    cancelAnimationFrame(this._zoomAnimationId)
    this._map._moveEnd(true)
  },

  _updateWheelZoom(this: ZoomState) {
    const map = this._map

    if (!map.getCenter().equals(this._prevCenter) || map.getZoom() !== this._prevZoom) return
    if (Math.abs(this._goalZoom - map.getZoom()) < 0.001) {
      cancelAnimationFrame(this._zoomAnimationId)
      return
    }

    const zoom = map.getZoom() + (this._goalZoom - map.getZoom()) * 0.3
    const roundedZoom = Math.round(zoom * 100) / 100
    const delta = this._wheelMousePosition.subtract(this._centerPoint)
    if (delta.x === 0 && delta.y === 0) return

    if (map.options.smoothWheelZoom === 'center') {
      this._center = this._startLatLng
    } else {
      this._center = map.unproject(
        map.project(this._wheelStartLatLng, roundedZoom).subtract(delta),
        roundedZoom,
      )
    }

    if (!this._moved) {
      map._moveStart(true, false)
      this._moved = true
    }

    map._move(this._center, roundedZoom)
    this._prevCenter = map.getCenter()
    this._prevZoom = map.getZoom()

    this._zoomAnimationId = requestAnimationFrame(() => this._updateWheelZoom())
  },
})

;(L.Map as unknown as { mergeOptions: (opts: object) => void }).mergeOptions({
  smoothWheelZoom: true,
  smoothSensitivity: 1,
})

;(L.Map as unknown as { addInitHook: (fn: string, handler: typeof L.Handler) => void }).addInitHook(
  'addHandler',
  Handler as unknown as typeof L.Handler,
)

;(L.Map as unknown as { SmoothWheelZoom?: typeof L.Handler }).SmoothWheelZoom = Handler as typeof L.Handler

export {}
