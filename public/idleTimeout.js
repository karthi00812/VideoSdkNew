var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var defaultResetEvents = [
    "load",
    "mousemove",
    "mousedown",
    "mouseup",
    "keypress",
    "DOMMouseScroll",
    "mousewheel",
    "MSPointerMove",
    "click",
    "scroll",
    "touchstart",
    "touchmove",
    "touchend"
];
var IdleSessionTimeout = (function () {
    function IdleSessionTimeout(timeSpan) {
        var resetEvents = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            resetEvents[_i - 1] = arguments[_i];
        }
        var _this = this;
        this.start = function () {
            var e_1, _a;
            if (_this.onTimeOut === undefined) {
                console.error("Missing onTimeOut method");
                return;
            }
            try {
                for (var _b = __values(_this._resetEvents), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var event_1 = _c.value;
                    window.addEventListener(event_1, _this.reset);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (_this.onTimeLeftChange !== undefined) {
                _this._timeLeftChangeEvent = window.setInterval(_this._onTimeLeftChange, 1000);
            }
            _this.reset();
        };
        this.reset = function () {
            if (_this._timerId !== undefined) {
                window.clearTimeout(_this._timerId);
            }
            _this._timerId = window.setTimeout(_this._onTimeOut, _this._timeSpan);
            _this._restTime = Date.now();
        };
        this.dispose = function () {
            var e_2, _a;
            try {
                for (var _b = __values(_this._resetEvents), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var event_2 = _c.value;
                    window.removeEventListener(event_2, _this.reset);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            if (_this._timerId !== undefined) {
                window.clearTimeout(_this._timerId);
            }
            if (_this._timeLeftChangeEvent !== undefined) {
                window.clearInterval(_this._timeLeftChangeEvent);
            }
        };
        this.getTimeLeft = function () {
            return _this._timeSpan - (Date.now() - _this._restTime);
        };
        this._onTimeOut = function () {
            _this.onTimeOut();
            _this.dispose();
        };
        this._onTimeLeftChange = function () {
            _this.onTimeLeftChange(_this.getTimeLeft());
        };
        this._timeSpan = timeSpan;
        this._resetEvents =
            resetEvents.length == 0 ? defaultResetEvents : resetEvents;
    }
    return IdleSessionTimeout;
}());