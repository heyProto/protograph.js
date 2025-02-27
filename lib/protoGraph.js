function UUID() {}
if ("function" != typeof define && "function" != typeof requireModule) {
    var define, requireModule;
    ! function() {
        var a = {},
            b = {};
        define = function(b, c, d) {
            a[b] = {
                deps: c,
                callback: d
            }
        }, requireModule = function(c) {
            if (b[c]) return b[c];
            var d = a[c];
            if (!d) throw new Error("Module: '" + c + "' not found.");
            for (var e, f = d.deps, g = d.callback, h = [], i = 0, j = f.length; j > i; i++) "exports" === f[i] ? h.push(e = {}) : h.push(requireModule(f[i]));
            var k = g.apply(this, h);
            return b[c] = e || k
        }, define.registry = a, define.seen = b
    }()
}(function() {
    "use strict";

    function a(a, b) {
        for (var c = 0, d = a.length; d > c; c++)
            if (a[c] === b) return c;
        return -1
    }

    function b(a) {
        var b = a._promiseCallbacks;
        return b || (b = a._promiseCallbacks = {}), b
    }

    function c(a, b) {
        return "onerror" === a ? void X.on("error", b) : 2 !== arguments.length ? X[a] : void(X[a] = b)
    }

    function d(a) {
        return "function" == typeof a || "object" == typeof a && null !== a
    }

    function e(a) {
        return "function" == typeof a
    }

    function f(a) {
        return "object" == typeof a && null !== a
    }

    function g() {}

    function h() {}

    function i(a) {
        try {
            return a.then
        } catch (b) {
            return fa.error = b, fa
        }
    }

    function j(a, b, c, d) {
        try {
            a.call(b, c, d)
        } catch (e) {
            return e
        }
    }

    function k(a, b, c) {
        X.async(function(a) {
            var d = !1,
                e = j(c, b, function(c) {
                    d || (d = !0, b !== c ? n(a, c) : p(a, c))
                }, function(b) {
                    d || (d = !0, q(a, b))
                }, "Settle: " + (a._label || " unknown promise"));
            !d && e && (d = !0, q(a, e))
        }, a)
    }

    function l(a, b) {
        b._state === da ? p(a, b._result) : a._state === ea ? q(a, b._result) : r(b, void 0, function(c) {
            b !== c ? n(a, c) : p(a, c)
        }, function(b) {
            q(a, b)
        })
    }

    function m(a, b) {
        if (b.constructor === a.constructor) l(a, b);
        else {
            var c = i(b);
            c === fa ? q(a, fa.error) : void 0 === c ? p(a, b) : e(c) ? k(a, b, c) : p(a, b)
        }
    }

    function n(a, b) {
        a === b ? p(a, b) : d(b) ? m(a, b) : p(a, b)
    }

    function o(a) {
        a._onerror && a._onerror(a._result), s(a)
    }

    function p(a, b) {
        a._state === ca && (a._result = b, a._state = da, 0 === a._subscribers.length ? X.instrument && ba("fulfilled", a) : X.async(s, a))
    }

    function q(a, b) {
        a._state === ca && (a._state = ea, a._result = b, X.async(o, a))
    }

    function r(a, b, c, d) {
        var e = a._subscribers,
            f = e.length;
        a._onerror = null, e[f] = b, e[f + da] = c, e[f + ea] = d, 0 === f && a._state && X.async(s, a)
    }

    function s(a) {
        var b = a._subscribers,
            c = a._state;
        if (X.instrument && ba(c === da ? "fulfilled" : "rejected", a), 0 !== b.length) {
            for (var d, e, f = a._result, g = 0; g < b.length; g += 3) d = b[g], e = b[g + c], d ? v(c, d, e, f) : e(f);
            a._subscribers.length = 0
        }
    }

    function t() {
        this.error = null
    }

    function u(a, b) {
        try {
            return a(b)
        } catch (c) {
            return ga.error = c, ga
        }
    }

    function v(a, b, c, d) {
        var f, g, h, i, j = e(c);
        if (j) {
            if (f = u(c, d), f === ga ? (i = !0, g = f.error, f = null) : h = !0, b === f) return void q(b, new TypeError("A promises callback cannot return that same promise."))
        } else f = d, h = !0;
        b._state !== ca || (j && h ? n(b, f) : i ? q(b, g) : a === da ? p(b, f) : a === ea && q(b, f))
    }

    function w(a, b) {
        try {
            b(function(b) {
                n(a, b)
            }, function(b) {
                q(a, b)
            })
        } catch (c) {
            q(a, c)
        }
    }

    function x(a, b, c) {
        return a === da ? {
            state: "fulfilled",
            value: c
        } : {
            state: "rejected",
            reason: c
        }
    }

    function y(a, b, c, d) {
        this._instanceConstructor = a, this.promise = new a(h, d), this._abortOnReject = c, this._validateInput(b) ? (this._input = b, this.length = b.length, this._remaining = b.length, this._init(), 0 === this.length ? p(this.promise, this._result) : (this.length = this.length || 0, this._enumerate(), 0 === this._remaining && p(this.promise, this._result))) : q(this.promise, this._validationError())
    }

    function z() {
        throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")
    }

    function A() {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")
    }

    function B(a, b) {
        this._id = na++, this._label = b, this._state = void 0, this._result = void 0, this._subscribers = [], X.instrument && ba("created", this), h !== a && (e(a) || z(), this instanceof B || A(), w(this, a))
    }

    function C() {
        this.value = void 0
    }

    function D(a) {
        try {
            return a.then
        } catch (b) {
            return pa.value = b, pa
        }
    }

    function E(a, b, c) {
        try {
            a.apply(b, c)
        } catch (d) {
            return pa.value = d, pa
        }
    }

    function F(a, b) {
        for (var c, d, e = {}, f = a.length, g = new Array(f), h = 0; f > h; h++) g[h] = a[h];
        for (d = 0; d < b.length; d++) c = b[d], e[c] = g[d + 1];
        return e
    }

    function G(a) {
        for (var b = a.length, c = new Array(b - 1), d = 1; b > d; d++) c[d - 1] = a[d];
        return c
    }

    function H(a, b) {
        return {
            then: function(c, d) {
                return a.call(b, c, d)
            }
        }
    }

    function I(a, b, c, d) {
        var e = E(c, d, b);
        return e === pa && q(a, e.value), a
    }

    function J(a, b, c, d) {
        return oa.all(b).then(function(b) {
            var e = E(c, d, b);
            return e === pa && q(a, e.value), a
        })
    }

    function K(a) {
        return a && "object" == typeof a ? a.constructor === oa ? !0 : D(a) : !1
    }

    function L(a, b, c) {
        this._superConstructor(a, b, !1, c)
    }

    function M(a, b, c) {
        this._superConstructor(a, b, !0, c)
    }

    function N(a, b, c) {
        this._superConstructor(a, b, !1, c)
    }

    function O() {
        return function() {
            process.nextTick(S)
        }
    }

    function P() {
        var a = 0,
            b = new Ia(S),
            c = document.createTextNode("");
        return b.observe(c, {
                characterData: !0
            }),
            function() {
                c.data = a = ++a % 2
            }
    }

    function Q() {
        var a = new MessageChannel;
        return a.port1.onmessage = S,
            function() {
                a.port2.postMessage(0)
            }
    }

    function R() {
        return function() {
            setTimeout(S, 1)
        }
    }

    function S() {
        for (var a = 0; Fa > a; a += 2) {
            var b = Ka[a],
                c = Ka[a + 1];
            b(c), Ka[a] = void 0, Ka[a + 1] = void 0
        }
        Fa = 0
    }

    function T(a, b) {
        X.async(a, b)
    }

    function U() {
        X.on.apply(X, arguments)
    }

    function V() {
        X.off.apply(X, arguments)
    }
    var W = {
            mixin: function(a) {
                return a.on = this.on, a.off = this.off, a.trigger = this.trigger, a._promiseCallbacks = void 0, a
            },
            on: function(c, d) {
                var e, f = b(this);
                e = f[c], e || (e = f[c] = []), -1 === a(e, d) && e.push(d)
            },
            off: function(c, d) {
                var e, f, g = b(this);
                return d ? (e = g[c], f = a(e, d), void(-1 !== f && e.splice(f, 1))) : void(g[c] = [])
            },
            trigger: function(a, c) {
                var d, e, f = b(this);
                if (d = f[a])
                    for (var g = 0; g < d.length; g++)(e = d[g])(c)
            }
        },
        X = {
            instrument: !1
        };
    W.mixin(X);
    var Y;
    Y = Array.isArray ? Array.isArray : function(a) {
        return "[object Array]" === Object.prototype.toString.call(a)
    };
    var Z = Y,
        $ = Date.now || function() {
            return (new Date).getTime()
        },
        _ = Object.create || function(a) {
            if (arguments.length > 1) throw new Error("Second argument not supported");
            if ("object" != typeof a) throw new TypeError("Argument must be an object");
            return g.prototype = a, new g
        },
        aa = [],
        ba = function(a, b, c) {
            1 === aa.push({
                name: a,
                payload: {
                    guid: b._guidKey + b._id,
                    eventName: a,
                    detail: b._result,
                    childGuid: c && b._guidKey + c._id,
                    label: b._label,
                    timeStamp: $(),
                    stack: new Error(b._label).stack
                }
            }) && setTimeout(function() {
                for (var a, b = 0; b < aa.length; b++) a = aa[b], X.trigger(a.name, a.payload);
                aa.length = 0
            }, 50)
        },
        ca = void 0,
        da = 1,
        ea = 2,
        fa = new t,
        ga = new t;
    y.prototype._validateInput = function(a) {
        return Z(a)
    }, y.prototype._validationError = function() {
        return new Error("Array Methods must be provided an Array")
    }, y.prototype._init = function() {
        this._result = new Array(this.length)
    };
    var ha = y;
    y.prototype._enumerate = function() {
        for (var a = this.length, b = this.promise, c = this._input, d = 0; b._state === ca && a > d; d++) this._eachEntry(c[d], d)
    }, y.prototype._eachEntry = function(a, b) {
        var c = this._instanceConstructor;
        f(a) ? a.constructor === c && a._state !== ca ? (a._onerror = null, this._settledAt(a._state, b, a._result)) : this._willSettleAt(c.resolve(a), b) : (this._remaining--, this._result[b] = this._makeResult(da, b, a))
    }, y.prototype._settledAt = function(a, b, c) {
        var d = this.promise;
        d._state === ca && (this._remaining--, this._abortOnReject && a === ea ? q(d, c) : this._result[b] = this._makeResult(a, b, c)), 0 === this._remaining && p(d, this._result)
    }, y.prototype._makeResult = function(a, b, c) {
        return c
    }, y.prototype._willSettleAt = function(a, b) {
        var c = this;
        r(a, void 0, function(a) {
            c._settledAt(da, b, a)
        }, function(a) {
            c._settledAt(ea, b, a)
        })
    };
    var ia = function(a, b) {
            return new ha(this, a, !0, b).promise
        },
        ja = function(a, b) {
            function c(a) {
                n(f, a)
            }

            function d(a) {
                q(f, a)
            }
            var e = this,
                f = new e(h, b);
            if (!Z(a)) return q(f, new TypeError("You must pass an array to race.")), f;
            for (var g = a.length, i = 0; f._state === ca && g > i; i++) r(e.resolve(a[i]), void 0, c, d);
            return f
        },
        ka = function(a, b) {
            var c = this;
            if (a && "object" == typeof a && a.constructor === c) return a;
            var d = new c(h, b);
            return n(d, a), d
        },
        la = function(a, b) {
            var c = this,
                d = new c(h, b);
            return q(d, a), d
        },
        ma = "rsvp_" + $() + "-",
        na = 0,
        oa = B;
    B.cast = ka, B.all = ia, B.race = ja, B.resolve = ka, B.reject = la, B.prototype = {
        constructor: B,
        _guidKey: ma,
        _onerror: function(a) {
            X.trigger("error", a)
        },
        then: function(a, b, c) {
            var d = this,
                e = d._state;
            if (e === da && !a || e === ea && !b) return X.instrument && ba("chained", this, this), this;
            d._onerror = null;
            var f = new this.constructor(h, c),
                g = d._result;
            if (X.instrument && ba("chained", d, f), e) {
                var i = arguments[e - 1];
                X.async(function() {
                    v(e, f, i, g)
                })
            } else r(d, f, a, b);
            return f
        },
        "catch": function(a, b) {
            return this.then(null, a, b)
        },
        "finally": function(a, b) {
            var c = this.constructor;
            return this.then(function(b) {
                return c.resolve(a()).then(function() {
                    return b
                })
            }, function(b) {
                return c.resolve(a()).then(function() {
                    throw b
                })
            }, b)
        }
    };
    var pa = new C,
        qa = new C,
        ra = function(a, b) {
            var c = function() {
                for (var c, d = this, e = arguments.length, f = new Array(e + 1), g = !1, i = 0; e > i; ++i) {
                    if (c = arguments[i], !g) {
                        if (g = K(c), g === qa) {
                            var j = new oa(h);
                            return q(j, qa.value), j
                        }
                        g && g !== !0 && (c = H(g, c))
                    }
                    f[i] = c
                }
                var k = new oa(h);
                return f[e] = function(a, c) {
                    a ? q(k, a) : void 0 === b ? n(k, c) : b === !0 ? n(k, G(arguments)) : Z(b) ? n(k, F(arguments, b)) : n(k, c)
                }, g ? J(k, f, a, d) : I(k, f, a, d)
            };
            return c.__proto__ = a, c
        },
        sa = function(a, b) {
            return oa.all(a, b)
        };
    L.prototype = _(ha.prototype), L.prototype._superConstructor = ha, L.prototype._makeResult = x, L.prototype._validationError = function() {
        return new Error("allSettled must be called with an array")
    };
    var ta = function(a, b) {
            return new L(oa, a, b).promise
        },
        ua = function(a, b) {
            return oa.race(a, b)
        },
        va = M;
    M.prototype = _(ha.prototype), M.prototype._superConstructor = ha, M.prototype._init = function() {
        this._result = {}
    }, M.prototype._validateInput = function(a) {
        return a && "object" == typeof a
    }, M.prototype._validationError = function() {
        return new Error("Promise.hash must be called with an object")
    }, M.prototype._enumerate = function() {
        var a = this.promise,
            b = this._input,
            c = [];
        for (var d in b) a._state === ca && b.hasOwnProperty(d) && c.push({
            position: d,
            entry: b[d]
        });
        var e = c.length;
        this._remaining = e;
        for (var f, g = 0; a._state === ca && e > g; g++) f = c[g], this._eachEntry(f.entry, f.position)
    };
    var wa = function(a, b) {
        return new va(oa, a, b).promise
    };
    N.prototype = _(va.prototype), N.prototype._superConstructor = ha, N.prototype._makeResult = x, N.prototype._validationError = function() {
        return new Error("hashSettled must be called with an object")
    };
    var xa, ya = function(a, b) {
            return new N(oa, a, b).promise
        },
        za = function(a) {
            throw setTimeout(function() {
                throw a
            }), a
        },
        Aa = function(a) {
            var b = {};
            return b.promise = new oa(function(a, c) {
                b.resolve = a, b.reject = c
            }, a), b
        },
        Ba = function(a, b, c) {
            return oa.all(a, c).then(function(a) {
                if (!e(b)) throw new TypeError("You must pass a function as map's second argument.");
                for (var d = a.length, f = new Array(d), g = 0; d > g; g++) f[g] = b(a[g]);
                return oa.all(f, c)
            })
        },
        Ca = function(a, b) {
            return oa.resolve(a, b)
        },
        Da = function(a, b) {
            return oa.reject(a, b)
        },
        Ea = function(a, b, c) {
            return oa.all(a, c).then(function(a) {
                if (!e(b)) throw new TypeError("You must pass a function as filter's second argument.");
                for (var d = a.length, f = new Array(d), g = 0; d > g; g++) f[g] = b(a[g]);
                return oa.all(f, c).then(function(b) {
                    for (var c = new Array(d), e = 0, f = 0; d > f; f++) b[f] && (c[e] = a[f], e++);
                    return c.length = e, c
                })
            })
        },
        Fa = 0,
        Ga = function(a, b) {
            Ka[Fa] = a, Ka[Fa + 1] = b, Fa += 2, 2 === Fa && xa()
        },
        Ha = "undefined" != typeof window ? window : {},
        Ia = Ha.MutationObserver || Ha.WebKitMutationObserver,
        Ja = "undefined" != typeof Uint8ClampedArray && "undefined" != typeof importScripts && "undefined" != typeof MessageChannel,
        Ka = new Array(1e3);
    xa = "undefined" != typeof process && "[object process]" === {}.toString.call(process) ? O() : Ia ? P() : Ja ? Q() : R(), X.async = Ga;
    if ("undefined" != typeof window && "object" == typeof window.__PROMISE_INSTRUMENTATION__) {
        var La = window.__PROMISE_INSTRUMENTATION__;
        c("instrument", !0);
        for (var Ma in La) La.hasOwnProperty(Ma) && U(Ma, La[Ma])
    }
    var Na = {
        race: ua,
        Promise: oa,
        allSettled: ta,
        hash: wa,
        hashSettled: ya,
        denodeify: ra,
        on: U,
        off: V,
        map: Ba,
        filter: Ea,
        resolve: Ca,
        reject: Da,
        all: sa,
        rethrow: za,
        defer: Aa,
        EventTarget: W,
        configure: c,
        async: T
    };
    "function" == typeof define && define.amd ? define(function() {
        return Na
    }) : "undefined" != typeof module && module.exports ? module.exports = Na : "undefined" != typeof this && (this.RSVP = Na)
}).call(this), define("rsvp", [], function() {
        return RSVP
    }), UUID.generate = function() {
        var a = UUID._gri,
            b = UUID._ha;
        return b(a(32), 8) + "-" + b(a(16), 4) + "-" + b(16384 | a(12), 4) + "-" + b(32768 | a(14), 4) + "-" + b(a(48), 12)
    }, UUID._gri = function(a) {
        return 0 > a ? NaN : 30 >= a ? 0 | Math.random() * (1 << a) : 53 >= a ? (0 | 1073741824 * Math.random()) + 1073741824 * (0 | Math.random() * (1 << a - 30)) : NaN
    }, UUID._ha = function(a, b) {
        for (var c = a.toString(16), d = b - c.length, e = "0"; d > 0; d >>>= 1, e += e) 1 & d && (c = e + c);
        return c
    },
    function(a) {
        var b, c, d, e = {}.toString;
        Kamino = {}, "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = Kamino), exports.Kamino = Kamino) : a.Kamino = Kamino, Kamino.VERSION = "0.1.0", KaminoException = function() {
            this.name = "KaminoException", this.number = 25, this.message = "Uncaught Error: DATA_CLONE_ERR: Kamino Exception 25"
        };
        var f = new Date(-0xc782b5b800cec);
        try {
            f = -109252 == f.getUTCFullYear() && 0 === f.getUTCMonth() && 1 == f.getUTCDate() && 10 == f.getUTCHours() && 37 == f.getUTCMinutes() && 6 == f.getUTCSeconds() && 708 == f.getUTCMilliseconds()
        } catch (g) {}
        var h = "A" != "A" [0];
        if (!f) {
            Math.floor
        }(b = {}.hasOwnProperty) || (b = function(a) {
            var c, d = {};
            return (d.__proto__ = null, d.__proto__ = {
                toString: 1
            }, d).toString != e ? b = function(a) {
                var b = this.__proto__,
                    c = a in (this.__proto__ = null, this);
                return this.__proto__ = b, c
            } : (c = d.constructor, b = function(a) {
                var b = (this.constructor || c).prototype;
                return a in this && !(a in b && this[a] === b[a])
            }), d = null, b.call(this, a)
        }), c = function(a, c) {
            var d, f, g, h, i = 0;
            (d = function() {
                this.valueOf = 0
            }).prototype.valueOf = 0, f = new d;
            for (g in f) b.call(f, g) && i++;
            return d = f = null, i ? h = 2 == i ? function(a, c) {
                var d, f = {},
                    g = "[object Function]" == e.call(a);
                for (d in a) g && "prototype" == d || b.call(f, d) || !(f[d] = 1) || !b.call(a, d) || c(d)
            } : function(a, c) {
                var d, f, g = "[object Function]" == e.call(a);
                for (d in a) g && "prototype" == d || !b.call(a, d) || (f = "constructor" === d) || c(d);
                (f || b.call(a, d = "constructor")) && c(d)
            } : (f = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"], h = function(a, c) {
                var d, g, h = "[object Function]" == e.call(a);
                for (d in a) h && "prototype" == d || !b.call(a, d) || c(d);
                for (g = f.length; d = f[--g]; b.call(a, d) && c(d));
            }), h(a, c)
        };
        var i = {
                "\\": "\\\\",
                '"': '\\"',
                "\b": "\\b",
                "\f": "\\f",
                "\n": "\\n",
                "\r": "\\r",
                "  ": "\\t"
            },
            j = function(a, b) {
                return ("000000" + (b || 0)).slice(-a)
            },
            k = function(a) {
                for (var b, c = '"', d = 0; b = a.charAt(d); d++) c += '\\"\b\f\n\r '.indexOf(b) > -1 ? i[b] : i[b] = " " > b ? "\\u00" + j(2, b.charCodeAt(0).toString(16)) : b;
                return c + '"'
            },
            l = function(a) {
                return "object" == typeof HTMLElement ? a instanceof HTMLElement : a && "object" == typeof a && 1 === a.nodeType && "string" == typeof a.nodeName
            },
            m = function(a, f, g, i, j, n, o) {
                var p, q, r, s, t, u, v, w, x, y, z = f[a],
                    A = "";
                if (z instanceof Error || z instanceof Function) throw new KaminoException;
                if (l(z)) throw new KaminoException;
                if ("object" == typeof z && z && (p = e.call(z), "[object Date]" != p || b.call(z, "toJSON") ? "function" == typeof z.toJSON && ("[object Number]" != p && "[object String]" != p && "[object Array]" != p || b.call(z, "toJSON")) && (z = z.toJSON(a)) : z = z > -1 / 0 && 1 / 0 > z ? z.toUTCString().replace("GMT", "UTC") : null), g && (z = g.call(f, a, z)), null === z) return "null";
                if (void 0 === z) return void 0;
                if (q = e.call(z), "[object Boolean]" == q) return "" + z;
                if ("[object Number]" == q) return z === Number.POSITIVE_INFINITY ? "Infinity" : z === Number.NEGATIVE_INFINITY ? "NInfinity" : isNaN(z) ? "NaN" : "" + z;
                if ("[object RegExp]" == q) return y = z.source, A += z.ignoreCase ? "i" : "", A += z.global ? "g" : "", A += z.multiline ? "m" : "", y = k(h ? y.split("") : y), A = k(h ? A.split("") : A), z = "^" + y + A;
                if ("[object String]" == q) return z = k(h ? z.split("") : z), "[object Date]" == p && (z = "%" + z), z;
                if ("object" == typeof z) {
                    for (u = o.length; u--;)
                        if (o[u] === z) return "&" + u;
                    if (o.push(z), r = [], v = n, n += j, "[object Array]" == q) {
                        for (t = 0, u = z.length; u > t; w || (w = !0), t++) s = m(t, z, g, i, j, n, o), r.push(s === d ? "null" : s);
                        x = w ? j ? "[\n" + n + r.join(",\n" + n) + "\n" + v + "]" : "[" + r.join(",") + "]" : "[]"
                    } else c(i || z, function(a) {
                        var b = m(a, z, g, i, j, n, o);
                        b !== d && r.push(k(h ? a.split("") : a) + ":" + (j ? " " : "") + b), w || (w = !0)
                    }), x = w ? j ? "{\n" + n + r.join(",\n" + n) + "\n" + v + "}" : "{" + r.join(",") + "}" : "{}";
                    return x
                }
            };
        Kamino.stringify = function(a, b, c) {
            var d, f, g;
            if ("function" == typeof b || "object" == typeof b && b)
                if ("[object Function]" == e.call(b)) f = b;
                else if ("[object Array]" == e.call(b)) {
                g = {};
                for (var h, i = 0, j = b.length; j > i; h = b[i++], ("[object String]" == e.call(h) || "[object Number]" == e.call(h)) && (g[h] = 1));
            }
            if (c)
                if ("[object Number]" == e.call(c)) {
                    if ((c -= c % 1) > 0)
                        for (d = "", c > 10 && (c = 10); d.length < c; d += " ");
                } else "[object String]" == e.call(c) && (d = c.length <= 10 ? c : c.slice(0, 10));
            return m("", (h = {}, h[""] = a, h), f, g, d, "", [])
        };
        var n, o, p, q = String.fromCharCode,
            r = {
                "\\": "\\",
                '"': '"',
                "/": "/",
                b: "\b",
                t: "    ",
                n: "\n",
                f: "\f",
                r: "\r"
            },
            s = function() {
                throw n = o = null, SyntaxError()
            },
            t = function(a) {
                a = a || "";
                var b, c, d, e, f = o,
                    g = f.length;
                for (b = a, n++; g > n;)
                    if (c = f[n], " " > c) s();
                    else if ("\\" == c)
                    if (c = f[++n], '\\"/btnfr'.indexOf(c) > -1) b += r[c], n++;
                    else if ("u" == c) {
                    for (d = ++n, e = n + 4; e > n; n++) c = f[n], c >= "0" && "9" >= c || c >= "a" && "f" >= c || c >= "A" && "F" >= c || s();
                    b += q("0x" + f.slice(d, n))
                } else s();
                else {
                    if ('"' == c) break;
                    b += c, n++
                }
                return '"' == f[n] ? (n++, b) : void s()
            },
            u = function() {
                for (var a, b, c, d, e, f, g, h = o, i = h.length; i > n;)
                    if (a = h[n], "   \r\n ".indexOf(a) > -1) n++;
                    else {
                        if ("{}[]:,".indexOf(a) > -1) return n++, a;
                        if ('"' == a) return t("@");
                        if ("%" == a) {
                            if (n++, a = h[n], '"' == a) return e = t(), new Date(e);
                            s()
                        } else if ("^" == a) {
                            if (n++, a = h[n], '"' == a && (f = t(), a = h[n], '"' == a)) return g = t(), new RegExp(f, g);
                            s()
                        } else if ("&" == a) {
                            if (n++, a = h[n], a >= "0" && "9" >= a) return n++, p[a];
                            s()
                        } else {
                            if (b = n, "-" == a && (d = !0, a = h[++n]), a >= "0" && "9" >= a) {
                                for ("0" == a && (a = h[n + 1], a >= "0" && "9" >= a) && s(), d = !1; i > n && (a = h[n], a >= "0" && "9" >= a); n++);
                                if ("." == h[n]) {
                                    for (c = ++n; i > c && (a = h[c], a >= "0" && "9" >= a); c++);
                                    c == n && s(), n = c
                                }
                                if (a = h[n], "e" == a || "E" == a) {
                                    for (a = h[++n], ("+" == a || "-" == a) && n++, c = n; i > c && (a = h[c], a >= "0" && "9" >= a); c++);
                                    c == n && s(), n = c
                                }
                                return +h.slice(b, n)
                            }
                            if (d && s(), "true" == h.slice(n, n + 4)) return n += 4, !0;
                            if ("false" == h.slice(n, n + 5)) return n += 5, !1;
                            if ("Infinity" == h.slice(n, n + 8)) return n += 8, 1 / 0;
                            if ("NInfinity" == h.slice(n, n + 9)) return n += 9, -(1 / 0);
                            if ("NaN" == h.slice(n, n + 3)) return n += 3, NaN;
                            if ("null" == h.slice(n, n + 4)) return n += 4, null;
                            s()
                        }
                    }
                return "$"
            },
            v = function(a) {
                var b, c;
                if ("$" == a && s(), "string" == typeof a) {
                    if ("@" == a[0]) return a.slice(1);
                    if ("[" == a) {
                        for (b = [], p[p.length] = b; a = u(), "]" != a; c || (c = !0)) c && ("," == a ? (a = u(), "]" == a && s()) : s()), "," == a && s(), b.push(v("string" == typeof a && h ? a.split("") : a));
                        return b
                    }
                    if ("{" == a) {
                        for (b = {}, p[p.length] = b; a = u(), "}" != a; c || (c = !0)) {
                            c && ("," == a ? (a = u(), "}" == a && s()) : s()), ("," == a || "string" != typeof a || "@" != a[0] || ":" != u()) && s();
                            var d = u();
                            b[a.slice(1)] = v("string" == typeof d && h ? d.split("") : d)
                        }
                        return b
                    }
                    s()
                }
                return a
            },
            w = function(a, b, c) {
                var e = x(a, b, c);
                e === d ? delete a[b] : a[b] = e
            },
            x = function(a, b, d) {
                var f, g = a[b];
                if ("object" == typeof g && g)
                    if ("[object Array]" == e.call(g))
                        for (f = g.length; f--;) w(g, f, d);
                    else c(g, function(a) {
                        w(g, a, d)
                    });
                return d.call(a, b, g)
            };
        Kamino.parse = function(a, b) {
            var c, d;
            return n = 0, o = "" + a, p = [], h && (o = a.split("")), c = v(u()), "$" != u() && s(), n = o = null, b && "[object Function]" == e.call(b) ? x((d = {}, d[""] = c, d), "", b) : c
        }, Kamino.clone = function(a) {
            return Kamino.parse(Kamino.stringify(a))
        }
    }(this),
    function(a) {
        function b(a) {
            return a && "[object Function]" === Object.prototype.toString.call(a)
        }

        function c() {
            return "undefined" == typeof Worker && "undefined" == typeof e
        }
        var d = a,
            e = d.Window,
            f = !1,
            g = [].slice;
        if (f || !d.MessageChannel) {
            var h = function(a) {
                    return "undefined" != typeof window && d instanceof e && (!b(d.Worker) || !(a instanceof Worker))
                },
                i = function(a) {
                    if (l.verbose) {
                        var b = g.apply(arguments);
                        b.unshift("MCNP: "), console.log.apply(console, b)
                    }
                },
                j = {},
                k = d.MessagePort = function(a) {
                    this._entangledPortUuid = null, this.destinationUrl = null, this._listeners = {}, this._messageQueue = [], this._messageQueueEnabled = !1, this._currentTarget = null, this.uuid = a || UUID.generate(), j[this.uuid] = this, this.log("created")
                };
            k.prototype = {
                start: function() {
                    var a, b = this;
                    setTimeout(function() {
                        for (b.log("draining " + b._messageQueue.length + " queued messages"); b._messageQueueEnabled && (a = b._messageQueue.shift());) b.dispatchEvent(a)
                    }), this._messageQueueEnabled = !0, this.log("started")
                },
                close: function() {
                    this._messageQueueEnabled = !1, this._entangledPortUuid && (this._getEntangledPort()._entangledPortUuid = null, this._entangledPortUuid = null)
                },
                postMessage: function(a) {
                    var b, c = this._getEntangledPort(),
                        d = this._currentTarget;
                    return c ? void(d ? (b = l.encodeEvent(a, [c], !0), h(d) ? (this.log("posting message from window to window", a, this.destinationUrl), d.postMessage(b, this.destinationUrl)) : (this.log("posting message from or to worker", a), d.postMessage(b))) : (this.log("not connected, queueing message", a), c._enqueueEvent(l._messageEvent(a, [c], !0)))) : void this.log("not entangled, discarding message", a)
                },
                addEventListener: function(a, b) {
                    "undefined" == typeof this._listeners[a] && (this._listeners[a] = []), this._listeners[a].push(b)
                },
                removeEventListener: function(a, b) {
                    if (this._listeners[a] instanceof Array)
                        for (var c = this._listeners[a], d = 0; d < c.length; d++)
                            if (c[d] === b) {
                                c.splice(d, 1);
                                break
                            }
                },
                dispatchEvent: function(a) {
                    var b = this._listeners.message;
                    if (b)
                        for (var c = 0; c < b.length; c++) b[c].call(this, a)
                },
                _enqueueEvent: function(a) {
                    this._messageQueueEnabled ? this.dispatchEvent(a) : this._messageQueue.push(a)
                },
                _getPort: function(a, b, c) {
                    var e = function(a) {
                            var b = j[a] || l._createPort(a);
                            return b
                        },
                        f = e(a.uuid);
                    if (f._entangledPortUuid = a._entangledPortUuid, f._getEntangledPort()._entangledPortUuid = f.uuid, f._currentTarget = b.source || b.currentTarget || d, "null" === b.origin ? f.destinationUrl = "*" : f.destinationUrl = b.origin, c)
                        for (var g = 0; g < a._messageQueue.length; g++) f._messageQueue.push(a._messageQueue[g]);
                    return f
                },
                _getEntangledPort: function() {
                    return this._entangledPortUuid ? j[this._entangledPortUuid] || l._createPort(this._entangledPortUuid) : null
                },
                log: function() {
                    if (l.verbose) {
                        var a = g.apply(arguments);
                        a.unshift("Port", this.uuid), i.apply(null, a)
                    }
                }
            };
            var l = d.MessageChannel = function() {
                var a, b = l._createPort(),
                    c = l._createPort();
                return b._entangledPortUuid = c.uuid, c._entangledPortUuid = b.uuid, a = {
                    port1: b,
                    port2: c
                }, l.log(a, "created"), a
            };
            l.log = function(a) {
                if (l.verbose) {
                    var b = ["Chnl"],
                        c = g.call(arguments, 1);
                    a.port1 && a.port2 ? b.push(a.port1.uuid, a.port2.uuid) : a.forEach(function(a) {
                        b.push(a._entangledPortUuid)
                    }), b.push.apply(b, c), i.apply(null, b)
                }
            }, l._createPort = function() {
                var a = arguments,
                    b = function() {
                        return k.apply(this, a)
                    };
                return b.prototype = k.prototype, new b
            }, l.encodeEvent = function(a, b, c) {
                for (var d, e, f = new Array(b.length), g = 0; g < b.length; ++g) f[g] = l._strippedPort(b[g]);
                return e = {
                    event: l._messageEvent(a, f, c)
                }, d = Kamino.stringify(e)
            }, l._messageEvent = function(a, b, c) {
                return {
                    data: a,
                    ports: b,
                    messageChannel: c
                }
            }, l._strippedPort = function(a) {
                if (a) {
                    for (var b, c, d, e = [], f = 0; f < a._messageQueue.length; ++f) {
                        b = a._messageQueue[f], c = b.ports || [], d = [];
                        for (var g, h = 0; h < c.length; ++h) g = c[h], d.push({
                            uuid: g.uuid,
                            _entangledPortUuid: g._entangledPortUuid
                        });
                        e.push({
                            data: b.data,
                            messageChannel: b.messageChannel,
                            ports: d
                        })
                    }
                    return {
                        uuid: a.uuid,
                        _entangledPortUuid: a._entangledPortUuid,
                        _messageQueue: e
                    }
                }
            }, l.decodeEvent = function(a, b) {
                var c = {
                        data: null,
                        ports: []
                    },
                    d = Kamino.parse(a.data),
                    e = d.event,
                    f = e.ports;
                if (e) {
                    if (f)
                        for (var g = 0; g < f.length; g++) c.ports.push(k.prototype._getPort(f[g], a, b));
                    c.data = e.data, c.source = a.source, c.messageChannel = e.messageChannel
                }
                return c
            };
            var m = function(a, b) {
                    var c;
                    try {
                        c = l.decodeEvent(a, b)
                    } catch (d) {
                        if (!(d instanceof SyntaxError)) throw d;
                        c = a
                    }
                    return c
                },
                n = function(a) {
                    var b = m(a, !0);
                    b.messageChannel && l.propagateEvent(b)
                },
                o = function(a) {
                    a.addEventListener ? a.addEventListener("message", n, !1) : a.attachEvent && a.attachEvent("onmessage", n)
                },
                p = function(a) {
                    var b, c, d, e, f;
                    a.addEventListener ? (c = "addEventListener", e = "removeEventListener", f = "message") : a.attachEvent && (c = "attachEvent", e = "detachEvent", f = "onmessage"), b = a[c], d = a[e], a[c] = function() {
                        var a, c = Array.prototype.slice.call(arguments),
                            d = c[1],
                            e = this;
                        c[0] === f && (a = function(a) {
                            var b = m(a);
                            b.messageChannel || d.call(e, b)
                        }, d.messageHandlerWrapper = a, c[1] = a), b.apply(this, c)
                    }, a[e] = function() {
                        var a = Array.prototype.slice.call(arguments),
                            b = a[1];
                        a[0] === f && (a[1] = b.messageHandlerWrapper, delete b.messageHandlerWrapper), a[1] && d.apply(this, a)
                    }
                };
            if (l.propagateEvent = function(a) {
                    var b, c, d;
                    if (a.messageChannel) {
                        b = a.ports;
                        for (var e = 0; e < b.length; e++) c = b[e], d = c._getEntangledPort(), c._currentTarget && d._currentTarget ? d.postMessage(a.data) : c._enqueueEvent(a)
                    }
                }, l.reset = function() {
                    j = {}
                }, o(d), e) {
                e.postMessage = function(a, b, c, d) {
                    var e, f;
                    if (d = d || [], e = l.encodeEvent(b, d, !1), d)
                        for (var g = 0; g < d.length; g++) f = d[g]._getEntangledPort(), f._currentTarget || (f._currentTarget = a, f.destinationUrl = c);
                    l.log(d, "handshake window", a), a.postMessage(e, c)
                };
                var q;
                if (window.addEventListener) q = window;
                else {
                    if (!window.attachEvent) throw "We couldn't find a method to attach an event handler.";
                    q = e.prototype
                }
                p(q)
            } else p(d);
            if (d.Worker) {
                var r, s = Worker;
                s.prototype.addEventListener ? r = s.prototype.addEventListener : s.prototype.attachEvent && (r = s.prototype.attachEvent), d.Worker = function() {
                    var a = new s(arguments[0]),
                        b = r;
                    return b.call(a, "message", n), a
                }, Worker.prototype = s.prototype, p(Worker.prototype)
            } else c() && (d.Worker = {});
            d.Worker && (d.Worker.postMessage = function(a, b, c) {
                for (var d, e = l.encodeEvent(b, c, !1), f = 0; f < c.length; f++) d = c[f]._getEntangledPort(), d._currentTarget = a;
                l.log(c, "handshake worker", a), a.postMessage(e)
            })
        } else e ? e.postMessage = function(a, b, c, d) {
            d = d || [], a.postMessage(b, c, d)
        } : d.Worker = {
            postMessage: function(a, b, c) {
                a.postMessage(b, c)
            }
        }, d.Worker && (d.Worker.postMessage = function(a, b, c) {
            a.postMessage(b, c)
        })
    }(this), define("oasis", ["oasis/util", "oasis/xhr", "oasis/connect", "rsvp", "oasis/logger", "oasis/version", "oasis/config", "oasis/sandbox", "oasis/sandbox_init", "oasis/events", "oasis/service", "oasis/iframe_adapter", "oasis/webworker_adapter", "oasis/inline_adapter"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
        "use strict";

        function o() {
            this.packages = {}, this.requestId = 0, this.oasisId = "oasis" + +new Date, this.consumers = {}, this.services = [], this.ports = {}, this.handlers = {}, this.receivedPorts = !1, this.configuration = new g, this.events = new j, this.didCreate()
        }
        var p = a.assert,
            q = a.delegate,
            r = b.xhr,
            s = c.connect,
            t = c.connectCapabilities,
            u = c.portFor;
        return o.Version = f, o.Service = o.Consumer = k, o.RSVP = d, o.reset = function() {
            o.adapters = {
                iframe: new l,
                webworker: new m,
                inline: new n
            }
        }, o.reset(), o.prototype = {
            logger: e,
            log: function() {
                this.logger.log.apply(this.logger, arguments)
            },
            on: q("events", "on"),
            off: q("events", "off"),
            trigger: q("events", "trigger"),
            didCreate: function() {},
            xhr: r,
            createSandbox: function(a) {
                return new h(this, a)
            },
            register: function(a) {
                p(a.capabilities, "You are trying to register a package without any capabilities. Please provide a list of requested capabilities, or an empty array ([])."), this.packages[a.url] = a
            },
            configure: function(a, b) {
                this.configuration[a] = b
            },
            autoInitializeSandbox: i,
            connect: s,
            connectCapabilities: t,
            portFor: u
        }, o
    }), define("oasis/base_adapter", ["oasis/util", "oasis/shims", "oasis/connect", "oasis/message_channel", "rsvp", "oasis/logger"], function(a, b, c, d, e, f) {
        "use strict";

        function g() {
            this._unsupportedCapabilities = []
        }
        var h = a.mustImplement,
            i = b.addEventListener,
            j = b.removeEventListener,
            k = b.a_indexOf,
            l = b.a_filter,
            m = (c.connectCapabilities, d.PostMessageMessageChannel);
        return g.prototype = {
            initializeSandbox: h("BaseAdapter", "initializeSandbox"),
            name: h("BaseAdapter", "name"),
            unsupportedCapabilities: function() {
                return this._unsupportedCapabilities
            },
            addUnsupportedCapability: function(a) {
                this._unsupportedCapabilities.push(a)
            },
            filterCapabilities: function(a) {
                var b = this._unsupportedCapabilities;
                return l.call(a, function(a) {
                    var c = k.call(b, a);
                    return -1 === c
                })
            },
            createChannel: function(a) {
                var b = new m(a);
                return b.port1.start(), b
            },
            environmentPort: function(a, b) {
                return b.port1
            },
            sandboxPort: function(a, b) {
                return b.port2
            },
            proxyPort: function(a, b) {
                return b
            },
            connectSandbox: function(a, b) {
                function c(e) {
                    e.data.isOasisInitialization && (j(a, "message", c), d.initializeOasisSandbox(e, b))
                }
                var d = this;
                f.log("Sandbox listening for initialization message"), i(a, "message", c), d.oasisLoaded(b)
            },
            initializeOasisSandbox: function(a, b) {
                var c = this;
                b.configuration.eventCallback(function() {
                    f.log("sandbox: received initialization message."), b.connectCapabilities(a.data.capabilities, a.ports), c.didConnect(b)
                })
            },
            createInitializationMessage: function(a) {
                return {
                    isOasisInitialization: !0,
                    capabilities: a._capabilitiesToConnect
                }
            },
            oasisLoadedMessage: "oasisSandboxLoaded",
            sandboxInitializedMessage: "oasisSandboxInitialized"
        }, g
    }), define("oasis/config", [], function() {
        "use strict";

        function a() {
            this.eventCallback = function(a) {
                a()
            }, this.allowSameOrigin = !1, this.reconnect = "verify"
        }
        return a
    }), define("oasis/connect", ["oasis/util", "oasis/shims", "oasis/message_channel", "rsvp", "oasis/logger", "exports"], function(a, b, c, d, e, f) {
        "use strict";

        function g(a, b, c) {
            var f = a.ports[b];
            f ? (e.log(a.oasisId, "sandbox: found port, setting up '" + b + "'"), c.setupCapability(f), c.promise ? c.promise.then(function() {
                f.start()
            })["catch"](d.rethrow) : f.start()) : a.receivedPorts ? (e.log("No port was sent for capability '" + b + "'"), c.rejectCapability()) : (e.log("No port found, saving handler for '" + b + "'"), a.handlers[b] = c)
        }

        function h(a, b, c) {
            return "object" == typeof a ? k(this, a.consumers) : b ? l(this, a, b, c) : m(this, a)
        }

        function i(a, b) {
            var c = this;
            o.call(a, function(a, f) {
                var g = c.handlers[a],
                    h = new p(c, b[f]);
                g && (e.log("Invoking handler for '" + a + "'"), d.resolve(g.setupCapability(h)).then(function() {
                    h.start()
                })["catch"](d.rethrow)), c.ports[a] = h
            });
            for (var f in c.handlers) c.ports[f] || c.handlers[f].rejectCapability();
            this.receivedPorts = !0
        }

        function j(a) {
            var b = this.ports[a];
            return n(b, "You asked for the port for the '" + a + "' capability, but the environment did not provide one."), b
        }

        function k(a, b) {
            function c(b, c) {
                return function(d) {
                    var e = new b(d);
                    a.consumers[c] = e, e.initialize(d, c)
                }
            }

            function d(a) {
                return function() {
                    b[a].prototype.error()
                }
            }
            for (var e in b) g(a, e, {
                setupCapability: c(b[e], e),
                rejectCapability: d(e)
            })
        }

        function l(a, b, c, d) {
            e.log("Connecting to '" + b + "' with callback."), g(a, b, {
                setupCapability: function(a) {
                    c(a)
                },
                rejectCapability: function() {
                    d && d()
                }
            })
        }

        function m(a, b) {
            e.log("Connecting to '" + b + "' with promise.");
            var c = d.defer();
            return g(a, b, {
                promise: c.promise,
                setupCapability: function(a) {
                    return c.resolve(a), c.promise
                },
                rejectCapability: function() {
                    c.reject()
                }
            }), c.promise
        }
        var n = a.assert,
            o = b.a_forEach,
            p = c.PostMessagePort;
        f.registerHandler = g, f.connect = h, f.connectCapabilities = i, f.portFor = j
    }), define("oasis/events", [], function() {
        "use strict";

        function a() {
            this.listenerArrays = {}
        }
        var b = Array.prototype.slice;
        return a.prototype = {
            on: function(a, b) {
                var c = this.listenerArrays[a] = this.listenerArrays[a] || [];
                c.push(b)
            },
            off: function(a, b) {
                var c = this.listenerArrays[a];
                if (c)
                    for (var d = 0; d < c.length; ++d)
                        if (c[d] === b) {
                            c.splice(d, 1);
                            break
                        }
            },
            clear: function(a) {
                delete this.listenerArrays[a]
            },
            trigger: function(a) {
                var c = this.listenerArrays[a];
                if (c)
                    for (var d = b.call(arguments, 1), e = 0; e < c.length; ++e) c[e].apply(null, d)
            }
        }, a
    }), define("oasis/iframe_adapter", ["oasis/util", "oasis/shims", "rsvp", "oasis/logger", "oasis/base_adapter"], function(a, b, c, d, e) {
        "use strict";

        function f(a, b) {
            var c, d = document.createElement("iframe");
            if ((a.configuration.allowSameOrigin && void 0 !== d.sandbox || void 0 === d.sandbox) && (c = document.createElement("a"), c.href = b, !c.host || c.protocol === window.location.protocol && c.host === window.location.host)) throw new Error("Security: iFrames from the same host cannot be sandboxed in older browsers and is disallowed.  For HTML5 browsers supporting the `sandbox` attribute on iframes, you can add the `allow-same-origin` flagonly if you host the sandbox on a separate domain.")
        }

        function g(a, b) {
            function c() {
                a.onerror(new Error("Cannot reconnect null origins unless `reconnect` is set to 'any'.  `reconnect: 'verify' requires `allowSameOrigin: true`"))
            }
            var d, e;
            if (a.firstLoad || "any" === a.options.reconnect) return !0;
            if (a.oasis.configuration.allowSameOrigin && "null" !== b.origin) {
                if (d = document.createElement("a"), e = document.createElement("a"), d.href = a.options.url, e.href = b.origin, e.protocol === d.protocol && e.host === d.host) return !0;
                c()
            } else c()
        }
        var h = (a.assert, a.extend),
            i = (b.a_forEach, b.addEventListener),
            j = b.removeEventListener,
            k = b.a_map,
            l = h(e, {
                initializeSandbox: function(a) {
                    var b = a.options,
                        e = document.createElement("iframe"),
                        h = ["allow-scripts"];
                    a.oasis.configuration.allowSameOrigin && h.push("allow-same-origin"), b && b.sandbox && b.sandbox.popups && h.push("allow-popups"), e.name = a.options.url + "?uuid=" + UUID.generate(), e.sandbox = h.join(" "), e.seamless = !0, b.width ? e.width = b.width : b.height && (e.height = b.height), e.errorHandler = function(b) {
                        if (b.data.sandboxException) {
                            try {
                                if (b.source !== e.contentWindow) return
                            } catch (c) {
                                return
                            }
                            a.onerror(b.data.sandboxException)
                        }
                    }, i(window, "message", e.errorHandler), f(a.oasis, a.options.url), e.src = a.options.url, d.log("Initializing sandbox " + e.name), a._waitForLoadDeferred().resolve(new c.Promise(function(b, c) {
                        e.initializationHandler = function(c) {
                            if (c.data === a.adapter.sandboxInitializedMessage) {
                                try {
                                    if (c.source !== e.contentWindow) return
                                } catch (f) {
                                    return
                                }
                                j(window, "message", e.initializationHandler), a.oasis.configuration.eventCallback(function() {
                                    d.log("container: iframe sandbox has initialized (capabilities connected)"), b(a)
                                })
                            }
                        }, i(window, "message", e.initializationHandler)
                    })), a.el = e, e.oasisLoadHandler = function(b) {
                        if (b.data === a.adapter.oasisLoadedMessage) {
                            try {
                                if (b.source !== e.contentWindow) return
                            } catch (c) {
                                return
                            }
                            d.log("container: iframe sandbox has loaded Oasis"), g(a, b) && a.createAndTransferCapabilities(), "none" === a.options.reconnect && j(window, "message", e.oasisLoadHandler)
                        }
                    }, i(window, "message", e.oasisLoadHandler)
                },
                startSandbox: function(a) {
                    var b = document.head || document.documentElement.getElementsByTagName("head")[0];
                    b.appendChild(a.el)
                },
                terminateSandbox: function(a) {
                    var b = a.el;
                    a.terminated = !0, b.loadHandler && j(b, "load", b.loadHandler), j(window, "message", b.initializationHandler), j(window, "message", b.oasisLoadHandler), b.parentNode && (d.log("Terminating sandbox ", a.el.name), b.parentNode.removeChild(b)), a.el = null
                },
                connectPorts: function(a, b) {
                    var c = k.call(b, function(a) {
                            return a.port
                        }),
                        d = this.createInitializationMessage(a);
                    a.terminated || Window.postMessage(a.el.contentWindow, d, "*", c)
                },
                connectSandbox: function(a) {
                    return e.prototype.connectSandbox.call(this, window, a)
                },
                oasisLoaded: function() {
                    window.parent.postMessage(this.oasisLoadedMessage, "*", [])
                },
                didConnect: function() {
                    window.parent.postMessage(this.sandboxInitializedMessage, "*", [])
                },
                name: function(a) {
                    return a.el.name
                }
            });
        return l
    }), define("oasis/inline_adapter", ["oasis/util", "oasis/config", "oasis/shims", "oasis/xhr", "rsvp", "oasis/logger", "oasis/base_adapter"], function(a, b, c, d, e, f, g) {
        "use strict";
        var h = (a.assert, a.extend),
            i = a.noop,
            j = (b.configuration, c.a_forEach, c.a_map),
            k = d.xhr,
            l = h(g, {
                initializeSandbox: function(a) {
                    a.el = document.createElement("div");
                    a.sandboxedOasis = new Oasis;
                    a.sandboxedOasis.sandbox = a, e.async(function() {
                        a.createAndTransferCapabilities()
                    })
                },
                startSandbox: function(a) {
                    var b = document.body || document.documentElement.getElementsByTagName("body")[0];
                    b.appendChild(a.el)
                },
                terminateSandbox: function(a) {
                    var b = a.el;
                    b.parentNode && (f.log("Terminating sandbox ", a.el.name), b.parentNode.removeChild(b)), a.el = null
                },
                connectPorts: function(a, b) {
                    var c = j.call(b, function(a) {
                            return a.port
                        }),
                        d = this.createInitializationMessage(a),
                        e = {
                            data: d,
                            ports: c
                        };
                    this.connectSandbox(a.sandboxedOasis, e)
                },
                fetchResource: function(a, b) {
                    var c = this;
                    return k(a, {
                        dataType: "text"
                    }, b).then(function(a) {
                        return c.wrapResource(a)
                    })["catch"](e.rethrow)
                },
                wrapResource: function(a) {
                    return new Function("oasis", a)
                },
                connectSandbox: function(a, b) {
                    return this.initializeOasisSandbox(b, a)
                },
                oasisLoaded: i,
                didConnect: function(a) {
                    function b(b) {
                        return f.log("sandbox: inline sandbox initialized"), b(a), a.sandbox
                    }

                    function c() {
                        return new e.Promise(function(c, e) {
                            c(d.fetchResource(a.sandbox.options.url, a).then(b))
                        })
                    }
                    var d = this;
                    return a.sandbox._waitForLoadDeferred().resolve(c()["catch"](e.rethrow))
                }
            });
        return l
    }), define("oasis/logger", [], function() {
        "use strict";

        function a() {
            this.enabled = !1
        }
        a.prototype = {
            enable: function() {
                this.enabled = !0
            },
            disable: function() {
                this.enabled = !1
            },
            log: function() {
                if (b.enabled)
                    if ("undefined" != typeof console && "function" == typeof console.log) console.log.apply(console, arguments);
                    else if ("undefined" != typeof console && "object" == typeof console.log) try {
                    switch (arguments.length) {
                        case 1:
                            console.log(arguments[0]);
                            break;
                        case 2:
                            console.log(arguments[0], arguments[1]);
                            break;
                        default:
                            console.log(arguments[0], arguments[1], arguments[2])
                    }
                } catch (a) {}
            }
        };
        var b = new a;
        return b
    }), define("oasis/message_channel", ["oasis/util", "rsvp", "exports"], function(a, b, c) {
        "use strict";

        function d(a, b) {}

        function e(a) {
            return a.oasisId + "-" + a.requestId++
        }

        function f(a) {}
        var g = a.extend,
            h = a.mustImplement;
        d.prototype = {
            on: h("OasisPort", "on"),
            all: h("OasisPort", "all"),
            off: h("OasisPort", "off"),
            send: h("OasisPort", "send"),
            start: h("OasisPort", "start"),
            close: h("OasisPort", "close"),
            request: function(a) {
                var c = this.oasis,
                    d = this,
                    f = [].slice.call(arguments, 1);
                return new b.Promise(function(b, g) {
                    var h = e(c),
                        i = function() {
                            d.off("@response:" + a, j), d.off("@errorResponse:" + a, k)
                        },
                        j = function(a) {
                            a.requestId === h && (i(), b(a.data))
                        },
                        k = function(a) {
                            a.requestId === h && (i(), g(a.data))
                        };
                    d.on("@response:" + a, j, d), d.on("@errorResponse:" + a, k, d), d.send("@request:" + a, {
                        requestId: h,
                        args: f
                    })
                })
            },
            onRequest: function(a, c, d) {
                var e = this;
                this.on("@request:" + a, function(f) {
                    var g = f.requestId,
                        h = (f.args, new b.Promise(function(b, e) {
                            var g = c.apply(d, f.args);
                            void 0 !== g ? b(g) : e("@request:" + a + " [" + f.requestId + "] did not return a value.  If you want to return a literal `undefined` return `RSVP.resolve(undefined)`")
                        }));
                    h.then(function(b) {
                        e.send("@response:" + a, {
                            requestId: g,
                            data: b
                        })
                    }, function(b) {
                        var c = b;
                        b instanceof Error && (c = {
                            message: b.message,
                            stack: b.stack
                        }), e.send("@errorResponse:" + a, {
                            requestId: g,
                            data: c
                        })
                    })
                })
            }
        }, f.prototype = {
            start: h("OasisMessageChannel", "start")
        };
        var i = g(f, {
                initialize: function(a) {
                    this.channel = new MessageChannel, this.port1 = new j(a, this.channel.port1), this.port2 = new j(a, this.channel.port2)
                },
                start: function() {
                    this.port1.start(), this.port2.start()
                },
                destroy: function() {
                    this.port1.close(), this.port2.close(), delete this.port1, delete this.port2, delete this.channel
                }
            }),
            j = g(d, {
                initialize: function(a, b) {
                    this.oasis = a, this.port = b, this._callbacks = []
                },
                on: function(a, b, c) {
                    function d(d) {
                        d.data.type === a && e.configuration.eventCallback(function() {
                            return b.call(c, d.data.data)
                        })
                    }
                    var e = this.oasis;
                    this._callbacks.push([b, d]), this.port.addEventListener("message", d)
                },
                all: function(a, b) {
                    function c(c) {
                        d.configuration.eventCallback(function() {
                            a.call(b, c.data.type, c.data.data)
                        })
                    }
                    var d = this.oasis;
                    this.port.addEventListener("message", c)
                },
                off: function(a, b) {
                    for (var c, d = 0, e = this._callbacks.length; e > d; d++) c = this._callbacks[d], c[0] === b && this.port.removeEventListener("message", c[1])
                },
                send: function(a, b) {
                    this.port.postMessage({
                        type: a,
                        data: b
                    })
                },
                start: function() {
                    this.port.start()
                },
                close: function() {
                    for (var a, b = 0, c = this._callbacks.length; c > b; b++) a = this._callbacks[b], this.port.removeEventListener("message", a[1]);
                    this._callbacks = [], this.port.close()
                }
            });
        c.OasisPort = d, c.PostMessageMessageChannel = i, c.PostMessagePort = j
    }), define("oasis/sandbox", ["oasis/util", "oasis/shims", "oasis/message_channel", "rsvp", "oasis/logger"], function(a, b, c, d, e) {
        "use strict";
        var f = a.assert,
            g = a.uniq,
            h = a.reverseMerge,
            i = b.a_forEach,
            j = b.a_reduce,
            k = (b.a_filter, c.OasisPort),
            l = function(a, b) {
                b = h(b || {}, {
                    reconnect: a.configuration.reconnect
                });
                var c = b.reconnect;
                f("none" === c || "verify" === c || "any" === c, "`reconnect` must be one of 'none', 'verify' or 'any'.  '" + c + "' is invalid."), this.connections = {}, this.wiretaps = [], this.oasis = a;
                var d = a.packages[b.url],
                    e = b.capabilities;
                e || (f(d, "You are trying to create a sandbox from an unregistered URL without providing capabilities. Please use Oasis.register to register your package or pass a list of capabilities to createSandbox."), e = d.capabilities), d = d || {}, this.adapter = b.adapter || Oasis.adapters.iframe, this._capabilitiesToConnect = this._filterCapabilities(e), this.envPortDefereds = {}, this.sandboxPortDefereds = {}, this.channels = {}, this.capabilities = {}, this.options = b, this.firstLoad = !0;
                this.promisePorts(), this.adapter.initializeSandbox(this)
            };
        return l.prototype = {
            waitForLoad: function() {
                return this._waitForLoadDeferred().promise
            },
            wiretap: function(a) {
                this.wiretaps.push(a)
            },
            connect: function(a) {
                var b = this.envPortDefereds[a].promise;
                return f(b, "Connect was called on '" + a + "' but no such capability was registered."), b
            },
            createAndTransferCapabilities: function() {
                this.firstLoad || this.promisePorts(), this.createChannels(), this.connectPorts(), this.firstLoad = !1
            },
            promisePorts: function() {
                i.call(this._capabilitiesToConnect, function(a) {
                    this.envPortDefereds[a] = d.defer(), this.sandboxPortDefereds[a] = d.defer()
                }, this)
            },
            createChannels: function() {
                var a = this,
                    b = this.options.services || {},
                    c = this.channels;
                i.call(this._capabilitiesToConnect, function(d) {
                    e.log("container: Will create port for '" + d + "'");
                    var f, g, h = b[d];
                    if (h instanceof k) g = this.adapter.proxyPort(this, h), this.capabilities[d] = h;
                    else {
                        f = c[d] = this.adapter.createChannel(a.oasis);
                        var j = this.adapter.environmentPort(this, f),
                            l = this.adapter.sandboxPort(this, f);
                        e.log("container: Wiretapping '" + d + "'"), j.all(function(a, b) {
                            i.call(this.wiretaps, function(c) {
                                c(d, {
                                    type: a,
                                    data: b,
                                    direction: "received"
                                })
                            })
                        }, this), i.call(this.wiretaps, function(a) {
                            var b = j.send;
                            j.send = function(c, e) {
                                a(d, {
                                    type: c,
                                    data: e,
                                    direction: "sent"
                                }), b.apply(j, arguments)
                            }
                        }), h && (e.log("container: Creating service for '" + d + "'"), h = new h(j, this), h.initialize(j, d), a.oasis.services.push(h), this.capabilities[d] = h), g = l, this.envPortDefereds[d].resolve(j)
                    }
                    e.log("container: Port created for '" + d + "'"), this.sandboxPortDefereds[d].resolve(g)
                }, this)
            },
            destroyChannels: function() {
                for (var a in this.channels) this.channels[a].destroy(), delete this.channels[a];
                this.channels = []
            },
            connectPorts: function() {
                var a = this,
                    b = j.call(this._capabilitiesToConnect, function(b, c) {
                        return b.concat(a.sandboxPortDefereds[c].promise)
                    }, []);
                d.all(b).then(function(b) {
                    e.log("container: All " + b.length + " ports created.  Transferring them."), a.adapter.connectPorts(a, b)
                })["catch"](d.rethrow)
            },
            start: function(a) {
                this.adapter.startSandbox(this, a)
            },
            terminate: function() {
                var a = this;
                if (!this.isTerminated) {
                    this.isTerminated = !0, this.adapter.terminateSandbox(this), this.destroyChannels();
                    for (var b = 0; b < a.oasis.services.length; b++) a.oasis.services[b].destroy(), delete a.oasis.services[b];
                    a.oasis.services = []
                }
            },
            onerror: function(a) {
                throw a
            },
            name: function() {
                return this.adapter.name(this)
            },
            _filterCapabilities: function(a) {
                return g.call(this.adapter.filterCapabilities(a))
            },
            _waitForLoadDeferred: function() {
                return this._loadDeferred || (this._loadDeferred = d.defer()), this._loadDeferred
            }
        }, l
    }), define("oasis/sandbox_init", [], function() {
        "use strict";

        function a() {
            if ("undefined" != typeof window) {
                if (/PhantomJS/.test(navigator.userAgent)) return;
                window.parent && window.parent !== window && Oasis.adapters.iframe.connectSandbox(this)
            } else Oasis.adapters.webworker.connectSandbox(this)
        }
        return a
    }), define("oasis/service", ["oasis/shims"], function(a) {
        "use strict";

        function b(a, b) {
            function c(a) {
                return function() {
                    return a.apply(f, arguments)
                }
            }
            var d, e, f = this;
            this.sandbox = b, this.port = a;
            for (d in this.events) e = this.events[d], a.on(d, c(e));
            for (d in this.requests) e = this.requests[d], a.onRequest(d, c(e))
        }
        var c = a.o_create;
        return b.prototype = {
            initialize: function() {},
            error: function() {},
            destroy: function() {},
            send: function() {
                return this.port.send.apply(this.port, arguments)
            },
            request: function() {
                return this.port.request.apply(this.port, arguments)
            }
        }, b.extend = function d(a) {
            function b() {
                b.prototype.init && b.prototype.init.call(this), e.apply(this, arguments)
            }
            var e = this;
            b.extend = d;
            var f = b.prototype = c(this.prototype);
            for (var g in a) f[g] = a[g];
            return b
        }, b
    }), define("oasis/shims", ["exports"], function(a) {
        "use strict";

        function b(a, b) {
            if (f.prototype = a, a = new f, b) {
                f.prototype = a;
                for (var c in b) f.prototype[c] = b[c].value;
                a = new f
            }
            return f.prototype = null, a
        }

        function c(a, b, c) {
            return a.addEventListener ? a.addEventListener(b, c) : a.attachEvent ? a.attachEvent("on" + b, c) : void 0
        }

        function d(a, b, c) {
            return a.removeEventListener ? a.removeEventListener(b, c) : a.detachEvent ? a.detachEvent("on" + b, c) : void 0
        }

        function e(a) {
            return a && Function.prototype.toString.call(a).indexOf("[native code]") > -1
        }
        var f = function() {},
            g = e(Array.prototype.forEach) ? Array.prototype.forEach : function(a) {
                if (void 0 === this || null === this) throw new TypeError;
                var b = Object(this),
                    c = b.length >>> 0;
                if ("function" != typeof a) throw new TypeError;
                for (var d = arguments[1], e = 0; c > e; e++) e in b && a.call(d, b[e], e, b)
            },
            h = e(Array.prototype.reduce) ? Array.prototype.reduce : function(a, b) {
                if (null === this || "undefined" == typeof this) throw new TypeError("Array.prototype.reduce called on null or undefined");
                if ("function" != typeof a) throw new TypeError(a + " is not a function");
                var c, d = 0,
                    e = this.length >>> 0,
                    f = !1;
                for (1 < arguments.length && (c = b, f = !0); e > d; ++d) this.hasOwnProperty(d) && (f ? c = a(c, this[d], d, this) : (c = this[d], f = !0));
                if (!f) throw new TypeError("Reduce of empty array with no initial value");
                return c
            },
            i = e(Array.prototype.map) ? Array.prototype.map : function(a, b) {
                var c, d, e;
                if (null == this) throw new TypeError(" this is null or not defined");
                var f = Object(this),
                    g = f.length >>> 0;
                if ("function" != typeof a) throw new TypeError(a + " is not a function");
                for (b && (c = b), d = new Array(g), e = 0; g > e;) {
                    var h, i;
                    e in f && (h = f[e], i = a.call(c, h, e, f), d[e] = i), e++
                }
                return d
            },
            j = e(Array.prototype.indexOf) ? Array.prototype.indexOf : function(a) {
                if (null == this) throw new TypeError;
                var b = Object(this),
                    c = b.length >>> 0;
                if (0 === c) return -1;
                var d = 0;
                if (arguments.length > 1 && (d = Number(arguments[1]), d != d ? d = 0 : 0 != d && d != 1 / 0 && d != -(1 / 0) && (d = (d > 0 || -1) * Math.floor(Math.abs(d)))), d >= c) return -1;
                for (var e = d >= 0 ? d : Math.max(c - Math.abs(d), 0); c > e; e++)
                    if (e in b && b[e] === a) return e;
                return -1
            },
            k = e(Array.prototype.filter) ? Array.prototype.filter : function(a) {
                if (!this) throw new TypeError;
                var b = Object(this);
                b.length >>> 0;
                if ("function" != typeof a) throw new TypeError;
                var c = [],
                    d = arguments[1];
                for (var e in b) b.hasOwnProperty(e) && a.call(d, b[e], e, b) && c.push(b[e]);
                return c
            };
        a.o_create = b, a.addEventListener = c, a.removeEventListener = d, a.a_forEach = g, a.a_reduce = h, a.a_map = i, a.a_indexOf = j, a.a_filter = k
    }), define("oasis/util", ["oasis/shims", "exports"], function(a, b) {
        "use strict";

        function c(a, b) {
            if (!a) throw new Error(b)
        }

        function d() {}

        function e(a, b) {
            return function() {
                throw new Error("Subclasses of " + a + " must implement " + b)
            }
        }

        function f(a, b) {
            function c() {
                a.apply(this, arguments), this.initialize && this.initialize.apply(this, arguments)
            }
            c.prototype = j(a.prototype);
            for (var d in b) b.hasOwnProperty(d) && (c.prototype[d] = b[d]);
            return c
        }

        function g(a, b) {
            return function() {
                var c = this[a];
                return c[b].apply(c, arguments)
            }
        }

        function h() {
            var a = {};
            return k.call(this, function(b) {
                var c = !a.hasOwnProperty(b);
                return a[b] = !0, c
            })
        }

        function i(a, b) {
            for (var c in b) b.hasOwnProperty(c) && (c in a || (a[c] = b[c]));
            return a
        }
        var j = a.o_create,
            k = a.a_filter;
        b.assert = c, b.noop = d, b.mustImplement = e, b.extend = f, b.delegate = g, b.uniq = h, b.reverseMerge = i
    }), define("oasis/version", [], function() {
        "use strict";
        return "0.4.0"
    }), define("oasis/webworker_adapter", ["oasis/util", "oasis/shims", "rsvp", "oasis/logger", "oasis/base_adapter"], function(a, b, c, d, e) {
        "use strict";
        var f = (a.assert, a.extend),
            g = (b.a_forEach, b.addEventListener),
            h = b.removeEventListener,
            i = f(e, {
                type: "js",
                initializeSandbox: function(a) {
                    var b = new Worker(a.options.url);
                    b.name = a.options.url + "?uuid=" + UUID.generate(), a.worker = b, b.errorHandler = function(b) {
                        b.data.sandboxException && a.onerror(b.data.sandboxException)
                    }, g(b, "message", b.errorHandler), a._waitForLoadDeferred().resolve(new c.Promise(function(c, e) {
                        b.initializationHandler = function(e) {
                            a.oasis.configuration.eventCallback(function() {
                                e.data === a.adapter.sandboxInitializedMessage && (h(b, "message", b.initializationHandler), d.log("worker sandbox initialized"), c(a))
                            })
                        }, g(b, "message", b.initializationHandler)
                    })), b.loadHandler = function(c) {
                        a.oasis.configuration.eventCallback(function() {
                            c.data === a.adapter.oasisLoadedMessage && (h(b, "message", b.loadHandler), d.log("worker sandbox initialized"), a.createAndTransferCapabilities())
                        })
                    }, g(b, "message", b.loadHandler)
                },
                startSandbox: function(a) {},
                terminateSandbox: function(a) {
                    var b = a.worker;
                    h(b, "message", b.loadHandler), h(b, "message", b.initializationHandler), a.worker.terminate()
                },
                connectPorts: function(a, b) {
                    var c = b.map(function(a) {
                            return a.port
                        }),
                        d = this.createInitializationMessage(a);
                    Worker.postMessage(a.worker, d, c)
                },
                connectSandbox: function(a) {
                    return e.prototype.connectSandbox.call(this, self, a)
                },
                name: function(a) {
                    return a.worker.name
                },
                oasisLoaded: function() {
                    postMessage(this.oasisLoadedMessage, [])
                },
                didConnect: function() {
                    postMessage(this.sandboxInitializedMessage, [])
                }
            });
        return i
    }), define("oasis/xhr", ["oasis/util", "rsvp", "exports"], function(a, b, c) {
        "use strict";

        function d(a) {
            var b = a.dataType;
            return b && p[b] ? p[b] : p["*"]
        }

        function e(a, b) {
            a.setRequestHeader("Accepts", d(b))
        }

        function f(a) {
            return a.status
        }

        function g() {
            return 200
        }

        function h(a, b) {
            if (b) {
                var c = n.call(arguments, 2);
                c.unshift(a), b.trigger.apply(b, c)
            }
        }

        function i(a, c, d) {
            return !d && this instanceof Oasis && (d = this), c || (c = o), new b.Promise(function(b, e) {
                var f = new j;
                f.open("get", a, !0), k(f, c), c.timeout && (f.timeout = c.timeout), f.onload = function() {
                    h("xhr.load", d, a, c, f);
                    var g = l(f);
                    g >= 200 && 300 > g ? b(f.responseText) : e(f)
                }, f.onprogress = m, f.ontimeout = function() {
                    h("xhr.timeout", d, a, c, f), e(f)
                }, f.onerror = function() {
                    h("xhr.error", d, a, c, f), e(f)
                }, h("xhr.send", d, a, c, f), f.send()
            })
        }
        var j, k, l, m = a.noop,
            n = Array.prototype.slice,
            o = {},
            p = {
                "*": "*/*",
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            };
        try {
            "withCredentials" in new XMLHttpRequest ? (j = XMLHttpRequest, k = e, l = f) : "undefined" != typeof XDomainRequest && (j = XDomainRequest, k = m, l = g)
        } catch (q) {
            "undefined" != typeof XDomainRequest && (j = XDomainRequest, k = m, l = g)
        }
        c.xhr = i
    }), self.Oasis = requireModule("oasis"), self.oasis = new self.Oasis, self.oasis.autoInitializeSandbox();

window.ProtoEmbed = window.ProtoEmbed || {};
ProtoEmbed.initFrame = function (element, url, mode, options) {
    if (typeof element == "string") {
        element = document.getElementById(element)
    }
    var blockquote = element.querySelector("blockquote");
    if (blockquote) {
        element.removeChild(blockquote);
    }
    var ResizeService = Oasis.Service.extend({
        initialize: function () {
            var that = this;
            setTimeout(function () {
                that.send("get_size");
            }, 1000);
            this.request('receive', mode, options).then(function (data) {
                resizeIframe(element.querySelector("iframe"), data)
            })
        },
        events: {
            resize_frame: function (data) {
                resizeIframe(element.querySelector("iframe"), data)
            }
        }
    });
    var sandbox = oasis.createSandbox({
        url: url,
        type: 'html',
        capabilities: ['receive'],
        services: {
            receive: ResizeService
        }
    });
    sandbox.el.setAttribute("sandbox", "allow-popups allow-scripts allow-same-origin allow-presentation allow-top-navigation")
    element.appendChild(sandbox.el);
    element.querySelector("iframe").style.width = '100%';
    element.querySelector("iframe").style.height = 'auto';
    element.querySelector("iframe").style.borderWidth = '0px';
    element.querySelector("iframe").style.visibility = 'hidden';

    function resizeIframe(obj, data) {
        if (data !== undefined) {
            obj.style.height = data.height + 'px';
            obj.style.width = (typeof (data.width) !== undefined && data.width != 0) ? data.width : '100%';
            obj.style.visibility = 'visible';
        }
    }

    return {
        sandbox: sandbox
    }
}