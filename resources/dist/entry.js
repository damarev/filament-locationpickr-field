// node_modules/@googlemaps/js-api-loader/dist/index.mjs
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var fastDeepEqual = function equal(a, b) {
  if (a === b)
    return true;
  if (a && b && typeof a == "object" && typeof b == "object") {
    if (a.constructor !== b.constructor)
      return false;
    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length)
        return false;
      for (i = length; i-- !== 0; )
        if (!equal(a[i], b[i]))
          return false;
      return true;
    }
    if (a.constructor === RegExp)
      return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf)
      return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString)
      return a.toString() === b.toString();
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length)
      return false;
    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
        return false;
    for (i = length; i-- !== 0; ) {
      var key = keys[i];
      if (!equal(a[key], b[key]))
        return false;
    }
    return true;
  }
  return a !== a && b !== b;
};
var isEqual = /* @__PURE__ */ getDefaultExportFromCjs(fastDeepEqual);
var DEFAULT_ID = "__googleMapsScriptId";
var LoaderStatus;
(function(LoaderStatus2) {
  LoaderStatus2[LoaderStatus2["INITIALIZED"] = 0] = "INITIALIZED";
  LoaderStatus2[LoaderStatus2["LOADING"] = 1] = "LOADING";
  LoaderStatus2[LoaderStatus2["SUCCESS"] = 2] = "SUCCESS";
  LoaderStatus2[LoaderStatus2["FAILURE"] = 3] = "FAILURE";
})(LoaderStatus || (LoaderStatus = {}));
var Loader = class _Loader {
  /**
   * Creates an instance of Loader using [[LoaderOptions]]. No defaults are set
   * using this library, instead the defaults are set by the Google Maps
   * JavaScript API server.
   *
   * ```
   * const loader = Loader({apiKey, version: 'weekly', libraries: ['places']});
   * ```
   */
  constructor({ apiKey, authReferrerPolicy, channel, client, id = DEFAULT_ID, language, libraries = [], mapIds, nonce, region, retries = 3, url = "https://maps.googleapis.com/maps/api/js", version }) {
    this.callbacks = [];
    this.done = false;
    this.loading = false;
    this.errors = [];
    this.apiKey = apiKey;
    this.authReferrerPolicy = authReferrerPolicy;
    this.channel = channel;
    this.client = client;
    this.id = id || DEFAULT_ID;
    this.language = language;
    this.libraries = libraries;
    this.mapIds = mapIds;
    this.nonce = nonce;
    this.region = region;
    this.retries = retries;
    this.url = url;
    this.version = version;
    if (_Loader.instance) {
      if (!isEqual(this.options, _Loader.instance.options)) {
        throw new Error(`Loader must not be called again with different options. ${JSON.stringify(this.options)} !== ${JSON.stringify(_Loader.instance.options)}`);
      }
      return _Loader.instance;
    }
    _Loader.instance = this;
  }
  get options() {
    return {
      version: this.version,
      apiKey: this.apiKey,
      channel: this.channel,
      client: this.client,
      id: this.id,
      libraries: this.libraries,
      language: this.language,
      region: this.region,
      mapIds: this.mapIds,
      nonce: this.nonce,
      url: this.url,
      authReferrerPolicy: this.authReferrerPolicy
    };
  }
  get status() {
    if (this.errors.length) {
      return LoaderStatus.FAILURE;
    }
    if (this.done) {
      return LoaderStatus.SUCCESS;
    }
    if (this.loading) {
      return LoaderStatus.LOADING;
    }
    return LoaderStatus.INITIALIZED;
  }
  get failed() {
    return this.done && !this.loading && this.errors.length >= this.retries + 1;
  }
  /**
   * CreateUrl returns the Google Maps JavaScript API script url given the [[LoaderOptions]].
   *
   * @ignore
   * @deprecated
   */
  createUrl() {
    let url = this.url;
    url += `?callback=__googleMapsCallback&loading=async`;
    if (this.apiKey) {
      url += `&key=${this.apiKey}`;
    }
    if (this.channel) {
      url += `&channel=${this.channel}`;
    }
    if (this.client) {
      url += `&client=${this.client}`;
    }
    if (this.libraries.length > 0) {
      url += `&libraries=${this.libraries.join(",")}`;
    }
    if (this.language) {
      url += `&language=${this.language}`;
    }
    if (this.region) {
      url += `&region=${this.region}`;
    }
    if (this.version) {
      url += `&v=${this.version}`;
    }
    if (this.mapIds) {
      url += `&map_ids=${this.mapIds.join(",")}`;
    }
    if (this.authReferrerPolicy) {
      url += `&auth_referrer_policy=${this.authReferrerPolicy}`;
    }
    return url;
  }
  deleteScript() {
    const script = document.getElementById(this.id);
    if (script) {
      script.remove();
    }
  }
  /**
   * Load the Google Maps JavaScript API script and return a Promise.
   * @deprecated, use importLibrary() instead.
   */
  load() {
    return this.loadPromise();
  }
  /**
   * Load the Google Maps JavaScript API script and return a Promise.
   *
   * @ignore
   * @deprecated, use importLibrary() instead.
   */
  loadPromise() {
    return new Promise((resolve, reject) => {
      this.loadCallback((err) => {
        if (!err) {
          resolve(window.google);
        } else {
          reject(err.error);
        }
      });
    });
  }
  importLibrary(name) {
    this.execute();
    return google.maps.importLibrary(name);
  }
  /**
   * Load the Google Maps JavaScript API script with a callback.
   * @deprecated, use importLibrary() instead.
   */
  loadCallback(fn) {
    this.callbacks.push(fn);
    this.execute();
  }
  /**
   * Set the script on document.
   */
  setScript() {
    var _a, _b;
    if (document.getElementById(this.id)) {
      this.callback();
      return;
    }
    const params = {
      key: this.apiKey,
      channel: this.channel,
      client: this.client,
      libraries: this.libraries.length && this.libraries,
      v: this.version,
      mapIds: this.mapIds,
      language: this.language,
      region: this.region,
      authReferrerPolicy: this.authReferrerPolicy
    };
    Object.keys(params).forEach(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (key) => !params[key] && delete params[key]
    );
    if (!((_b = (_a = window === null || window === void 0 ? void 0 : window.google) === null || _a === void 0 ? void 0 : _a.maps) === null || _b === void 0 ? void 0 : _b.importLibrary)) {
      ((g) => {
        let h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
        b = b[c] || (b[c] = {});
        const d = b.maps || (b.maps = {}), r = /* @__PURE__ */ new Set(), e = new URLSearchParams(), u = () => (
          // @ts-ignore
          h || (h = new Promise((f, n) => __awaiter(this, void 0, void 0, function* () {
            var _a2;
            yield a = m.createElement("script");
            a.id = this.id;
            e.set("libraries", [...r] + "");
            for (k in g)
              e.set(k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()), g[k]);
            e.set("callback", c + ".maps." + q);
            a.src = this.url + `?` + e;
            d[q] = f;
            a.onerror = () => h = n(Error(p + " could not load."));
            a.nonce = this.nonce || ((_a2 = m.querySelector("script[nonce]")) === null || _a2 === void 0 ? void 0 : _a2.nonce) || "";
            m.head.append(a);
          })))
        );
        d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
      })(params);
    }
    const libraryPromises = this.libraries.map((library) => this.importLibrary(library));
    if (!libraryPromises.length) {
      libraryPromises.push(this.importLibrary("core"));
    }
    Promise.all(libraryPromises).then(() => this.callback(), (error) => {
      const event = new ErrorEvent("error", { error });
      this.loadErrorCallback(event);
    });
  }
  /**
   * Reset the loader state.
   */
  reset() {
    this.deleteScript();
    this.done = false;
    this.loading = false;
    this.errors = [];
    this.onerrorEvent = null;
  }
  resetIfRetryingFailed() {
    if (this.failed) {
      this.reset();
    }
  }
  loadErrorCallback(e) {
    this.errors.push(e);
    if (this.errors.length <= this.retries) {
      const delay = this.errors.length * Math.pow(2, this.errors.length);
      console.error(`Failed to load Google Maps script, retrying in ${delay} ms.`);
      setTimeout(() => {
        this.deleteScript();
        this.setScript();
      }, delay);
    } else {
      this.onerrorEvent = e;
      this.callback();
    }
  }
  callback() {
    this.done = true;
    this.loading = false;
    this.callbacks.forEach((cb) => {
      cb(this.onerrorEvent);
    });
    this.callbacks = [];
  }
  execute() {
    this.resetIfRetryingFailed();
    if (this.loading) {
      return;
    }
    if (this.done) {
      this.callback();
    } else {
      if (window.google && window.google.maps && window.google.maps.version) {
        console.warn("Google Maps already loaded outside @googlemaps/js-api-loader. This may result in undesirable behavior as options and script parameters may not match.");
        this.callback();
        return;
      }
      this.loading = true;
      this.setScript();
    }
  }
};

// resources/js/entry.js
function locationPickrEntry({ location, config }) {
  return {
    map: null,
    marker: null,
    markerLocation: null,
    loader: null,
    location: null,
    config: {
      defaultLocation: {
        lat: 0,
        lng: 0
      },
      defaultZoom: 8,
      apiKey: ""
    },
    init: function() {
      this.location = location;
      this.config = { ...this.config, ...config };
      this.loadGmaps();
    },
    loadGmaps: function() {
      this.loader = new Loader({
        apiKey: this.config.apiKey,
        version: "weekly"
      });
      this.loader.load().then((google2) => {
        this.map = new google2.maps.Map(this.$refs.map, {
          center: this.getCoordinates(),
          zoom: this.config.defaultZoom,
          ...this.config.controls
        });
        this.marker = new google2.maps.Marker({
          map: this.map
        });
        this.marker.setPosition(this.getCoordinates());
      }).catch((error) => {
        console.error("Error loading Google Maps API:", error);
      });
    },
    getCoordinates: function() {
      let location2 = JSON.parse(this.location);
      if (location2 === null || !location2.hasOwnProperty("lat") || !location2.hasOwnProperty("lng")) {
        location2 = {
          lat: this.config.defaultLocation.lat,
          lng: this.config.defaultLocation.lng
        };
      }
      return location2;
    }
  };
}
export {
  locationPickrEntry as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL0Bnb29nbGVtYXBzL2pzLWFwaS1sb2FkZXIvbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQGdvb2dsZW1hcHMvanMtYXBpLWxvYWRlci9ub2RlX21vZHVsZXMvZmFzdC1kZWVwLWVxdWFsL2luZGV4LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AZ29vZ2xlbWFwcy9qcy1hcGktbG9hZGVyL3NyYy9pbmRleC50cyIsICIuLi9qcy9lbnRyeS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19lc0RlY29yYXRlKGN0b3IsIGRlc2NyaXB0b3JJbiwgZGVjb3JhdG9ycywgY29udGV4dEluLCBpbml0aWFsaXplcnMsIGV4dHJhSW5pdGlhbGl6ZXJzKSB7XHJcbiAgICBmdW5jdGlvbiBhY2NlcHQoZikgeyBpZiAoZiAhPT0gdm9pZCAwICYmIHR5cGVvZiBmICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGdW5jdGlvbiBleHBlY3RlZFwiKTsgcmV0dXJuIGY7IH1cclxuICAgIHZhciBraW5kID0gY29udGV4dEluLmtpbmQsIGtleSA9IGtpbmQgPT09IFwiZ2V0dGVyXCIgPyBcImdldFwiIDoga2luZCA9PT0gXCJzZXR0ZXJcIiA/IFwic2V0XCIgOiBcInZhbHVlXCI7XHJcbiAgICB2YXIgdGFyZ2V0ID0gIWRlc2NyaXB0b3JJbiAmJiBjdG9yID8gY29udGV4dEluW1wic3RhdGljXCJdID8gY3RvciA6IGN0b3IucHJvdG90eXBlIDogbnVsbDtcclxuICAgIHZhciBkZXNjcmlwdG9yID0gZGVzY3JpcHRvckluIHx8ICh0YXJnZXQgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgY29udGV4dEluLm5hbWUpIDoge30pO1xyXG4gICAgdmFyIF8sIGRvbmUgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fTtcclxuICAgICAgICBmb3IgKHZhciBwIGluIGNvbnRleHRJbikgY29udGV4dFtwXSA9IHAgPT09IFwiYWNjZXNzXCIgPyB7fSA6IGNvbnRleHRJbltwXTtcclxuICAgICAgICBmb3IgKHZhciBwIGluIGNvbnRleHRJbi5hY2Nlc3MpIGNvbnRleHQuYWNjZXNzW3BdID0gY29udGV4dEluLmFjY2Vzc1twXTtcclxuICAgICAgICBjb250ZXh0LmFkZEluaXRpYWxpemVyID0gZnVuY3Rpb24gKGYpIHsgaWYgKGRvbmUpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgYWRkIGluaXRpYWxpemVycyBhZnRlciBkZWNvcmF0aW9uIGhhcyBjb21wbGV0ZWRcIik7IGV4dHJhSW5pdGlhbGl6ZXJzLnB1c2goYWNjZXB0KGYgfHwgbnVsbCkpOyB9O1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAoMCwgZGVjb3JhdG9yc1tpXSkoa2luZCA9PT0gXCJhY2Nlc3NvclwiID8geyBnZXQ6IGRlc2NyaXB0b3IuZ2V0LCBzZXQ6IGRlc2NyaXB0b3Iuc2V0IH0gOiBkZXNjcmlwdG9yW2tleV0sIGNvbnRleHQpO1xyXG4gICAgICAgIGlmIChraW5kID09PSBcImFjY2Vzc29yXCIpIHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdm9pZCAwKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCB8fCB0eXBlb2YgcmVzdWx0ICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkXCIpO1xyXG4gICAgICAgICAgICBpZiAoXyA9IGFjY2VwdChyZXN1bHQuZ2V0KSkgZGVzY3JpcHRvci5nZXQgPSBfO1xyXG4gICAgICAgICAgICBpZiAoXyA9IGFjY2VwdChyZXN1bHQuc2V0KSkgZGVzY3JpcHRvci5zZXQgPSBfO1xyXG4gICAgICAgICAgICBpZiAoXyA9IGFjY2VwdChyZXN1bHQuaW5pdCkpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChfID0gYWNjZXB0KHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgaWYgKGtpbmQgPT09IFwiZmllbGRcIikgaW5pdGlhbGl6ZXJzLnVuc2hpZnQoXyk7XHJcbiAgICAgICAgICAgIGVsc2UgZGVzY3JpcHRvcltrZXldID0gXztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGFyZ2V0KSBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBjb250ZXh0SW4ubmFtZSwgZGVzY3JpcHRvcik7XHJcbiAgICBkb25lID0gdHJ1ZTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3J1bkluaXRpYWxpemVycyh0aGlzQXJnLCBpbml0aWFsaXplcnMsIHZhbHVlKSB7XHJcbiAgICB2YXIgdXNlVmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5pdGlhbGl6ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFsdWUgPSB1c2VWYWx1ZSA/IGluaXRpYWxpemVyc1tpXS5jYWxsKHRoaXNBcmcsIHZhbHVlKSA6IGluaXRpYWxpemVyc1tpXS5jYWxsKHRoaXNBcmcpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVzZVZhbHVlID8gdmFsdWUgOiB2b2lkIDA7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wcm9wS2V5KHgpIHtcclxuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gXCJzeW1ib2xcIiA/IHggOiBcIlwiLmNvbmNhdCh4KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NldEZ1bmN0aW9uTmFtZShmLCBuYW1lLCBwcmVmaXgpIHtcclxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzeW1ib2xcIikgbmFtZSA9IG5hbWUuZGVzY3JpcHRpb24gPyBcIltcIi5jb25jYXQobmFtZS5kZXNjcmlwdGlvbiwgXCJdXCIpIDogXCJcIjtcclxuICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoZiwgXCJuYW1lXCIsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogcHJlZml4ID8gXCJcIi5jb25jYXQocHJlZml4LCBcIiBcIiwgbmFtZSkgOiBuYW1lIH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChnICYmIChnID0gMCwgb3BbMF0gJiYgKF8gPSAwKSksIF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2NyZWF0ZUJpbmRpbmcgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xyXG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcclxuICAgICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20sIHBhY2spIHtcclxuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xyXG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogZmFsc2UgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XHJcbiAgICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyID09PSBzdGF0ZSA6IHN0YXRlLmhhcyhyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZShlbnYsIHZhbHVlLCBhc3luYykge1xyXG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkLlwiKTtcclxuICAgICAgICB2YXIgZGlzcG9zZTtcclxuICAgICAgICBpZiAoYXN5bmMpIHtcclxuICAgICAgICAgICAgaWYgKCFTeW1ib2wuYXN5bmNEaXNwb3NlKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jRGlzcG9zZSBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICAgICAgICAgIGRpc3Bvc2UgPSB2YWx1ZVtTeW1ib2wuYXN5bmNEaXNwb3NlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpc3Bvc2UgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBpZiAoIVN5bWJvbC5kaXNwb3NlKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmRpc3Bvc2UgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgICAgICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmRpc3Bvc2VdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGRpc3Bvc2UgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBub3QgZGlzcG9zYWJsZS5cIik7XHJcbiAgICAgICAgZW52LnN0YWNrLnB1c2goeyB2YWx1ZTogdmFsdWUsIGRpc3Bvc2U6IGRpc3Bvc2UsIGFzeW5jOiBhc3luYyB9KTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGFzeW5jKSB7XHJcbiAgICAgICAgZW52LnN0YWNrLnB1c2goeyBhc3luYzogdHJ1ZSB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxudmFyIF9TdXBwcmVzc2VkRXJyb3IgPSB0eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbiAoZXJyb3IsIHN1cHByZXNzZWQsIG1lc3NhZ2UpIHtcclxuICAgIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgcmV0dXJuIGUubmFtZSA9IFwiU3VwcHJlc3NlZEVycm9yXCIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2Rpc3Bvc2VSZXNvdXJjZXMoZW52KSB7XHJcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcclxuICAgICAgICBlbnYuZXJyb3IgPSBlbnYuaGFzRXJyb3IgPyBuZXcgX1N1cHByZXNzZWRFcnJvcihlLCBlbnYuZXJyb3IsIFwiQW4gZXJyb3Igd2FzIHN1cHByZXNzZWQgZHVyaW5nIGRpc3Bvc2FsLlwiKSA6IGU7XHJcbiAgICAgICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgd2hpbGUgKGVudi5zdGFjay5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIHJlYyA9IGVudi5zdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZWMuZGlzcG9zZSAmJiByZWMuZGlzcG9zZS5jYWxsKHJlYy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVjLmFzeW5jKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkudGhlbihuZXh0LCBmdW5jdGlvbihlKSB7IGZhaWwoZSk7IHJldHVybiBuZXh0KCk7IH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBmYWlsKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlbnYuaGFzRXJyb3IpIHRocm93IGVudi5lcnJvcjtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXh0KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIF9fZXh0ZW5kczogX19leHRlbmRzLFxyXG4gICAgX19hc3NpZ246IF9fYXNzaWduLFxyXG4gICAgX19yZXN0OiBfX3Jlc3QsXHJcbiAgICBfX2RlY29yYXRlOiBfX2RlY29yYXRlLFxyXG4gICAgX19wYXJhbTogX19wYXJhbSxcclxuICAgIF9fbWV0YWRhdGE6IF9fbWV0YWRhdGEsXHJcbiAgICBfX2F3YWl0ZXI6IF9fYXdhaXRlcixcclxuICAgIF9fZ2VuZXJhdG9yOiBfX2dlbmVyYXRvcixcclxuICAgIF9fY3JlYXRlQmluZGluZzogX19jcmVhdGVCaW5kaW5nLFxyXG4gICAgX19leHBvcnRTdGFyOiBfX2V4cG9ydFN0YXIsXHJcbiAgICBfX3ZhbHVlczogX192YWx1ZXMsXHJcbiAgICBfX3JlYWQ6IF9fcmVhZCxcclxuICAgIF9fc3ByZWFkOiBfX3NwcmVhZCxcclxuICAgIF9fc3ByZWFkQXJyYXlzOiBfX3NwcmVhZEFycmF5cyxcclxuICAgIF9fc3ByZWFkQXJyYXk6IF9fc3ByZWFkQXJyYXksXHJcbiAgICBfX2F3YWl0OiBfX2F3YWl0LFxyXG4gICAgX19hc3luY0dlbmVyYXRvcjogX19hc3luY0dlbmVyYXRvcixcclxuICAgIF9fYXN5bmNEZWxlZ2F0b3I6IF9fYXN5bmNEZWxlZ2F0b3IsXHJcbiAgICBfX2FzeW5jVmFsdWVzOiBfX2FzeW5jVmFsdWVzLFxyXG4gICAgX19tYWtlVGVtcGxhdGVPYmplY3Q6IF9fbWFrZVRlbXBsYXRlT2JqZWN0LFxyXG4gICAgX19pbXBvcnRTdGFyOiBfX2ltcG9ydFN0YXIsXHJcbiAgICBfX2ltcG9ydERlZmF1bHQ6IF9faW1wb3J0RGVmYXVsdCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRHZXQ6IF9fY2xhc3NQcml2YXRlRmllbGRHZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0OiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEluOiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4sXHJcbiAgICBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZTogX19hZGREaXNwb3NhYmxlUmVzb3VyY2UsXHJcbiAgICBfX2Rpc3Bvc2VSZXNvdXJjZXM6IF9fZGlzcG9zZVJlc291cmNlcyxcclxufTtcclxuIiwgIid1c2Ugc3RyaWN0JztcblxuLy8gZG8gbm90IGVkaXQgLmpzIGZpbGVzIGRpcmVjdGx5IC0gZWRpdCBzcmMvaW5kZXguanN0XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVxdWFsKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHJldHVybiB0cnVlO1xuXG4gIGlmIChhICYmIGIgJiYgdHlwZW9mIGEgPT0gJ29iamVjdCcgJiYgdHlwZW9mIGIgPT0gJ29iamVjdCcpIHtcbiAgICBpZiAoYS5jb25zdHJ1Y3RvciAhPT0gYi5jb25zdHJ1Y3RvcikgcmV0dXJuIGZhbHNlO1xuXG4gICAgdmFyIGxlbmd0aCwgaSwga2V5cztcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhKSkge1xuICAgICAgbGVuZ3RoID0gYS5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoICE9IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSAhPT0gMDspXG4gICAgICAgIGlmICghZXF1YWwoYVtpXSwgYltpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG5cbiAgICBpZiAoYS5jb25zdHJ1Y3RvciA9PT0gUmVnRXhwKSByZXR1cm4gYS5zb3VyY2UgPT09IGIuc291cmNlICYmIGEuZmxhZ3MgPT09IGIuZmxhZ3M7XG4gICAgaWYgKGEudmFsdWVPZiAhPT0gT2JqZWN0LnByb3RvdHlwZS52YWx1ZU9mKSByZXR1cm4gYS52YWx1ZU9mKCkgPT09IGIudmFsdWVPZigpO1xuICAgIGlmIChhLnRvU3RyaW5nICE9PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKSByZXR1cm4gYS50b1N0cmluZygpID09PSBiLnRvU3RyaW5nKCk7XG5cbiAgICBrZXlzID0gT2JqZWN0LmtleXMoYSk7XG4gICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCAhPT0gT2JqZWN0LmtleXMoYikubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSAhPT0gMDspXG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXlzW2ldKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gIT09IDA7KSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcblxuICAgICAgaWYgKCFlcXVhbChhW2tleV0sIGJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIHRydWUgaWYgYm90aCBOYU4sIGZhbHNlIG90aGVyd2lzZVxuICByZXR1cm4gYSE9PWEgJiYgYiE9PWI7XG59O1xuIiwgIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgR29vZ2xlIExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0LlxuICpcbiAqICAgICAgSHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wLlxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IGlzRXF1YWwgZnJvbSBcImZhc3QtZGVlcC1lcXVhbFwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9JRCA9IFwiX19nb29nbGVNYXBzU2NyaXB0SWRcIjtcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvbGlicmFyaWVzI2xpYnJhcmllcy1mb3ItZHluYW1pYy1saWJyYXJ5LWltcG9ydFxuZXhwb3J0IHR5cGUgTGlicmFyeSA9XG4gIHwgXCJjb3JlXCJcbiAgfCBcIm1hcHNcIlxuICB8IFwicGxhY2VzXCJcbiAgfCBcImdlb2NvZGluZ1wiXG4gIHwgXCJyb3V0ZXNcIlxuICB8IFwibWFya2VyXCJcbiAgfCBcImdlb21ldHJ5XCJcbiAgfCBcImVsZXZhdGlvblwiXG4gIHwgXCJzdHJlZXRWaWV3XCJcbiAgfCBcImpvdXJuZXlTaGFyaW5nXCJcbiAgfCBcImRyYXdpbmdcIlxuICB8IFwidmlzdWFsaXphdGlvblwiO1xuXG5leHBvcnQgdHlwZSBMaWJyYXJpZXMgPSBMaWJyYXJ5W107XG5cbi8qKlxuICogVGhlIEdvb2dsZSBNYXBzIEphdmFTY3JpcHQgQVBJXG4gKiBbZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvdHV0b3JpYWwpXG4gKiBpcyB0aGUgYXV0aG9yaXRhdGl2ZSBzb3VyY2UgZm9yIFtbTG9hZGVyT3B0aW9uc11dLlxuLyoqXG4gKiBMb2FkZXIgb3B0aW9uc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIExvYWRlck9wdGlvbnMge1xuICAvKipcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L2dldC1hcGkta2V5LlxuICAgKi9cbiAgYXBpS2V5OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBTZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9wcmVtaXVtL292ZXJ2aWV3LlxuICAgKi9cbiAgY2hhbm5lbD86IHN0cmluZztcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL3ByZW1pdW0vb3ZlcnZpZXcsIHVzZSBgYXBpS2V5YCBpbnN0ZWFkLlxuICAgKi9cbiAgY2xpZW50Pzogc3RyaW5nO1xuICAvKipcbiAgICogSW4geW91ciBhcHBsaWNhdGlvbiB5b3UgY2FuIHNwZWNpZnkgcmVsZWFzZSBjaGFubmVscyBvciB2ZXJzaW9uIG51bWJlcnM6XG4gICAqXG4gICAqIFRoZSB3ZWVrbHkgdmVyc2lvbiBpcyBzcGVjaWZpZWQgd2l0aCBgdmVyc2lvbj13ZWVrbHlgLiBUaGlzIHZlcnNpb24gaXNcbiAgICogdXBkYXRlZCBvbmNlIHBlciB3ZWVrLCBhbmQgaXMgdGhlIG1vc3QgY3VycmVudC5cbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGxvYWRlciA9IExvYWRlcih7YXBpS2V5LCB2ZXJzaW9uOiAnd2Vla2x5J30pO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhlIHF1YXJ0ZXJseSB2ZXJzaW9uIGlzIHNwZWNpZmllZCB3aXRoIGB2ZXJzaW9uPXF1YXJ0ZXJseWAuIFRoaXMgdmVyc2lvblxuICAgKiBpcyB1cGRhdGVkIG9uY2UgcGVyIHF1YXJ0ZXIsIGFuZCBpcyB0aGUgbW9zdCBwcmVkaWN0YWJsZS5cbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGxvYWRlciA9IExvYWRlcih7YXBpS2V5LCB2ZXJzaW9uOiAncXVhcnRlcmx5J30pO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhlIHZlcnNpb24gbnVtYmVyIGlzIHNwZWNpZmllZCB3aXRoIGB2ZXJzaW9uPW4ubm5gLiBZb3UgY2FuIGNob29zZVxuICAgKiBgdmVyc2lvbj0zLjQwYCwgYHZlcnNpb249My4zOWAsIG9yIGB2ZXJzaW9uPTMuMzhgLiBWZXJzaW9uIG51bWJlcnMgYXJlXG4gICAqIHVwZGF0ZWQgb25jZSBwZXIgcXVhcnRlci5cbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGxvYWRlciA9IExvYWRlcih7YXBpS2V5LCB2ZXJzaW9uOiAnMy40MCd9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIElmIHlvdSBkbyBub3QgZXhwbGljaXRseSBzcGVjaWZ5IGEgdmVyc2lvbiwgeW91IHdpbGwgcmVjZWl2ZSB0aGVcbiAgICogd2Vla2x5IHZlcnNpb24gYnkgZGVmYXVsdC5cbiAgICovXG4gIHZlcnNpb24/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgaWQgb2YgdGhlIHNjcmlwdCB0YWcuIEJlZm9yZSBhZGRpbmcgYSBuZXcgc2NyaXB0LCB0aGUgTG9hZGVyIHdpbGwgY2hlY2sgZm9yIGFuIGV4aXN0aW5nIG9uZS5cbiAgICovXG4gIGlkPzogc3RyaW5nO1xuICAvKipcbiAgICogV2hlbiBsb2FkaW5nIHRoZSBNYXBzIEphdmFTY3JpcHQgQVBJIHZpYSB0aGUgVVJMIHlvdSBtYXkgb3B0aW9uYWxseSBsb2FkXG4gICAqIGFkZGl0aW9uYWwgbGlicmFyaWVzIHRocm91Z2ggdXNlIG9mIHRoZSBsaWJyYXJpZXMgVVJMIHBhcmFtZXRlci4gTGlicmFyaWVzXG4gICAqIGFyZSBtb2R1bGVzIG9mIGNvZGUgdGhhdCBwcm92aWRlIGFkZGl0aW9uYWwgZnVuY3Rpb25hbGl0eSB0byB0aGUgbWFpbiBNYXBzXG4gICAqIEphdmFTY3JpcHQgQVBJIGJ1dCBhcmUgbm90IGxvYWRlZCB1bmxlc3MgeW91IHNwZWNpZmljYWxseSByZXF1ZXN0IHRoZW0uXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBsb2FkZXIgPSBMb2FkZXIoe1xuICAgKiAgYXBpS2V5LFxuICAgKiAgbGlicmFyaWVzOiBbJ2RyYXdpbmcnLCAnZ2VvbWV0cnknLCAncGxhY2VzJywgJ3Zpc3VhbGl6YXRpb24nXSxcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBTZXQgdGhlIFtsaXN0IG9mIGxpYnJhcmllc10oaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvbGlicmFyaWVzKSBmb3IgbW9yZSBvcHRpb25zLlxuICAgKi9cbiAgbGlicmFyaWVzPzogTGlicmFyaWVzO1xuICAvKipcbiAgICogQnkgZGVmYXVsdCwgdGhlIE1hcHMgSmF2YVNjcmlwdCBBUEkgdXNlcyB0aGUgdXNlcidzIHByZWZlcnJlZCBsYW5ndWFnZVxuICAgKiBzZXR0aW5nIGFzIHNwZWNpZmllZCBpbiB0aGUgYnJvd3Nlciwgd2hlbiBkaXNwbGF5aW5nIHRleHR1YWwgaW5mb3JtYXRpb25cbiAgICogc3VjaCBhcyB0aGUgbmFtZXMgZm9yIGNvbnRyb2xzLCBjb3B5cmlnaHQgbm90aWNlcywgZHJpdmluZyBkaXJlY3Rpb25zIGFuZFxuICAgKiBsYWJlbHMgb24gbWFwcy4gSW4gbW9zdCBjYXNlcywgaXQncyBwcmVmZXJhYmxlIHRvIHJlc3BlY3QgdGhlIGJyb3dzZXJcbiAgICogc2V0dGluZy4gSG93ZXZlciwgaWYgeW91IHdhbnQgdGhlIE1hcHMgSmF2YVNjcmlwdCBBUEkgdG8gaWdub3JlIHRoZVxuICAgKiBicm93c2VyJ3MgbGFuZ3VhZ2Ugc2V0dGluZywgeW91IGNhbiBmb3JjZSBpdCB0byBkaXNwbGF5IGluZm9ybWF0aW9uIGluIGFcbiAgICogcGFydGljdWxhciBsYW5ndWFnZSB3aGVuIGxvYWRpbmcgdGhlIE1hcHMgSmF2YVNjcmlwdCBBUEkgY29kZS5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSBsb2NhbGl6ZXMgdGhlIGxhbmd1YWdlIHRvIEphcGFuOlxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgbG9hZGVyID0gTG9hZGVyKHthcGlLZXksIGxhbmd1YWdlOiAnamEnLCByZWdpb246ICdKUCd9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIFNlZSB0aGUgW2xpc3Qgb2Ygc3VwcG9ydGVkXG4gICAqIGxhbmd1YWdlc10oaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9mYXEjbGFuZ3VhZ2VzdXBwb3J0KS4gTm90ZVxuICAgKiB0aGF0IG5ldyBsYW5ndWFnZXMgYXJlIGFkZGVkIG9mdGVuLCBzbyB0aGlzIGxpc3QgbWF5IG5vdCBiZSBleGhhdXN0aXZlLlxuICAgKlxuICAgKi9cbiAgbGFuZ3VhZ2U/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBXaGVuIHlvdSBsb2FkIHRoZSBNYXBzIEphdmFTY3JpcHQgQVBJIGZyb20gbWFwcy5nb29nbGVhcGlzLmNvbSBpdCBhcHBsaWVzIGFcbiAgICogZGVmYXVsdCBiaWFzIGZvciBhcHBsaWNhdGlvbiBiZWhhdmlvciB0b3dhcmRzIHRoZSBVbml0ZWQgU3RhdGVzLiBJZiB5b3VcbiAgICogd2FudCB0byBhbHRlciB5b3VyIGFwcGxpY2F0aW9uIHRvIHNlcnZlIGRpZmZlcmVudCBtYXAgdGlsZXMgb3IgYmlhcyB0aGVcbiAgICogYXBwbGljYXRpb24gKHN1Y2ggYXMgYmlhc2luZyBnZW9jb2RpbmcgcmVzdWx0cyB0b3dhcmRzIHRoZSByZWdpb24pLCB5b3UgY2FuXG4gICAqIG92ZXJyaWRlIHRoaXMgZGVmYXVsdCBiZWhhdmlvciBieSBhZGRpbmcgYSByZWdpb24gcGFyYW1ldGVyIHdoZW4gbG9hZGluZ1xuICAgKiB0aGUgTWFwcyBKYXZhU2NyaXB0IEFQSSBjb2RlLlxuICAgKlxuICAgKiBUaGUgcmVnaW9uIHBhcmFtZXRlciBhY2NlcHRzIFVuaWNvZGUgcmVnaW9uIHN1YnRhZyBpZGVudGlmaWVycyB3aGljaFxuICAgKiAoZ2VuZXJhbGx5KSBoYXZlIGEgb25lLXRvLW9uZSBtYXBwaW5nIHRvIGNvdW50cnkgY29kZSBUb3AtTGV2ZWwgRG9tYWluc1xuICAgKiAoY2NUTERzKS4gTW9zdCBVbmljb2RlIHJlZ2lvbiBpZGVudGlmaWVycyBhcmUgaWRlbnRpY2FsIHRvIElTTyAzMTY2LTFcbiAgICogY29kZXMsIHdpdGggc29tZSBub3RhYmxlIGV4Y2VwdGlvbnMuIEZvciBleGFtcGxlLCBHcmVhdCBCcml0YWluJ3MgY2NUTEQgaXNcbiAgICogXCJ1a1wiIChjb3JyZXNwb25kaW5nIHRvIHRoZSBkb21haW4gLmNvLnVrKSB3aGlsZSBpdHMgcmVnaW9uIGlkZW50aWZpZXIgaXNcbiAgICogXCJHQi5cIlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgdGhlIGZvbGxvd2luZyBleGFtcGxlIGxvY2FsaXplcyB0aGUgbWFwIHRvIHRoZSBVbml0ZWQgS2luZ2RvbTpcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGxvYWRlciA9IExvYWRlcih7YXBpS2V5LCByZWdpb246ICdHQid9KTtcbiAgICogYGBgXG4gICAqL1xuICByZWdpb24/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBQYXNzaW5nIGBtYXBJZHNgIGlzIG5vIGxvbmdlciByZXF1aXJlZCBpbiB0aGUgc2NyaXB0IHRhZy5cbiAgICovXG4gIG1hcElkcz86IHN0cmluZ1tdO1xuICAvKipcbiAgICogVXNlIGEgY3VzdG9tIHVybCBhbmQgcGF0aCB0byBsb2FkIHRoZSBHb29nbGUgTWFwcyBBUEkgc2NyaXB0LlxuICAgKi9cbiAgdXJsPzogc3RyaW5nO1xuICAvKipcbiAgICogVXNlIGEgY3J5cHRvZ3JhcGhpYyBub25jZSBhdHRyaWJ1dGUuXG4gICAqL1xuICBub25jZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2Ygc2NyaXB0IGxvYWQgcmV0cmllcy5cbiAgICovXG4gIHJldHJpZXM/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBNYXBzIEpTIGN1c3RvbWVycyBjYW4gY29uZmlndXJlIEhUVFAgUmVmZXJyZXIgUmVzdHJpY3Rpb25zIGluIHRoZSBDbG91ZFxuICAgKiBDb25zb2xlIHRvIGxpbWl0IHdoaWNoIFVSTHMgYXJlIGFsbG93ZWQgdG8gdXNlIGEgcGFydGljdWxhciBBUEkgS2V5LiBCeVxuICAgKiBkZWZhdWx0LCB0aGVzZSByZXN0cmljdGlvbnMgY2FuIGJlIGNvbmZpZ3VyZWQgdG8gYWxsb3cgb25seSBjZXJ0YWluIHBhdGhzXG4gICAqIHRvIHVzZSBhbiBBUEkgS2V5LiBJZiBhbnkgVVJMIG9uIHRoZSBzYW1lIGRvbWFpbiBvciBvcmlnaW4gbWF5IHVzZSB0aGUgQVBJXG4gICAqIEtleSwgeW91IGNhbiBzZXQgYGF1dGhfcmVmZXJyZXJfcG9saWN5PW9yaWdpbmAgdG8gbGltaXQgdGhlIGFtb3VudCBvZiBkYXRhXG4gICAqIHNlbnQgd2hlbiBhdXRob3JpemluZyByZXF1ZXN0cyBmcm9tIHRoZSBNYXBzIEphdmFTY3JpcHQgQVBJLiBUaGlzIGlzXG4gICAqIGF2YWlsYWJsZSBzdGFydGluZyBpbiB2ZXJzaW9uIDMuNDYuIFdoZW4gdGhpcyBwYXJhbWV0ZXIgaXMgc3BlY2lmaWVkIGFuZFxuICAgKiBIVFRQIFJlZmVycmVyIFJlc3RyaWN0aW9ucyBhcmUgZW5hYmxlZCBvbiBDbG91ZCBDb25zb2xlLCBNYXBzIEphdmFTY3JpcHRcbiAgICogQVBJIHdpbGwgb25seSBiZSBhYmxlIHRvIGxvYWQgaWYgdGhlcmUgaXMgYW4gSFRUUCBSZWZlcnJlciBSZXN0cmljdGlvbiB0aGF0XG4gICAqIG1hdGNoZXMgdGhlIGN1cnJlbnQgd2Vic2l0ZSdzIGRvbWFpbiB3aXRob3V0IGEgcGF0aCBzcGVjaWZpZWQuXG4gICAqL1xuICBhdXRoUmVmZXJyZXJQb2xpY3k/OiBcIm9yaWdpblwiO1xufVxuXG4vKipcbiAqIFRoZSBzdGF0dXMgb2YgdGhlIFtbTG9hZGVyXV0uXG4gKi9cbmV4cG9ydCBlbnVtIExvYWRlclN0YXR1cyB7XG4gIElOSVRJQUxJWkVELFxuICBMT0FESU5HLFxuICBTVUNDRVNTLFxuICBGQUlMVVJFLFxufVxuXG4vKipcbiAqIFtbTG9hZGVyXV0gbWFrZXMgaXQgZWFzaWVyIHRvIGFkZCBHb29nbGUgTWFwcyBKYXZhU2NyaXB0IEFQSSB0byB5b3VyIGFwcGxpY2F0aW9uXG4gKiBkeW5hbWljYWxseSB1c2luZ1xuICogW1Byb21pc2VzXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm9taXNlKS5cbiAqIEl0IHdvcmtzIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFuZCBhcHBlbmRpbmcgYSBzY3JpcHQgbm9kZSB0byB0aGUgdGhlXG4gKiBkb2N1bWVudCBoZWFkIGFuZCB3cmFwcGluZyB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gc28gYXMgdG8gcmV0dXJuIGEgcHJvbWlzZS5cbiAqXG4gKiBgYGBcbiAqIGNvbnN0IGxvYWRlciA9IG5ldyBMb2FkZXIoe1xuICogICBhcGlLZXk6IFwiXCIsXG4gKiAgIHZlcnNpb246IFwid2Vla2x5XCIsXG4gKiAgIGxpYnJhcmllczogW1wicGxhY2VzXCJdXG4gKiB9KTtcbiAqXG4gKiBsb2FkZXIubG9hZCgpLnRoZW4oKGdvb2dsZSkgPT4ge1xuICogICBjb25zdCBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKC4uLilcbiAqIH0pXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIExvYWRlciB7XG4gIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBMb2FkZXI7XG4gIC8qKlxuICAgKiBTZWUgW1tMb2FkZXJPcHRpb25zLnZlcnNpb25dXVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHZlcnNpb246IHN0cmluZztcbiAgLyoqXG4gICAqIFNlZSBbW0xvYWRlck9wdGlvbnMuYXBpS2V5XV1cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBhcGlLZXk6IHN0cmluZztcbiAgLyoqXG4gICAqIFNlZSBbW0xvYWRlck9wdGlvbnMuY2hhbm5lbF1dXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY2hhbm5lbDogc3RyaW5nO1xuICAvKipcbiAgICogU2VlIFtbTG9hZGVyT3B0aW9ucy5jbGllbnRdXVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGNsaWVudDogc3RyaW5nO1xuICAvKipcbiAgICogU2VlIFtbTG9hZGVyT3B0aW9ucy5pZF1dXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcbiAgLyoqXG4gICAqIFNlZSBbW0xvYWRlck9wdGlvbnMubGlicmFyaWVzXV1cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBsaWJyYXJpZXM6IExpYnJhcmllcztcbiAgLyoqXG4gICAqIFNlZSBbW0xvYWRlck9wdGlvbnMubGFuZ3VhZ2VdXVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGxhbmd1YWdlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNlZSBbW0xvYWRlck9wdGlvbnMucmVnaW9uXV1cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSByZWdpb246IHN0cmluZztcblxuICAvKipcbiAgICogU2VlIFtbTG9hZGVyT3B0aW9ucy5tYXBJZHNdXVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IG1hcElkczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFNlZSBbW0xvYWRlck9wdGlvbnMubm9uY2VdXVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IG5vbmNlOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBTZWUgW1tMb2FkZXJPcHRpb25zLnJldHJpZXNdXVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHJldHJpZXM6IG51bWJlcjtcblxuICAvKipcbiAgICogU2VlIFtbTG9hZGVyT3B0aW9ucy51cmxdXVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHVybDogc3RyaW5nO1xuICAvKipcbiAgICogU2VlIFtbTG9hZGVyT3B0aW9ucy5hdXRoUmVmZXJyZXJQb2xpY3ldXVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGF1dGhSZWZlcnJlclBvbGljeTogXCJvcmlnaW5cIjtcblxuICBwcml2YXRlIGNhbGxiYWNrczogKChlOiBFcnJvckV2ZW50KSA9PiB2b2lkKVtdID0gW107XG4gIHByaXZhdGUgZG9uZSA9IGZhbHNlO1xuICBwcml2YXRlIGxvYWRpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBvbmVycm9yRXZlbnQ6IEVycm9yRXZlbnQ7XG4gIHByaXZhdGUgZXJyb3JzOiBFcnJvckV2ZW50W10gPSBbXTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBMb2FkZXIgdXNpbmcgW1tMb2FkZXJPcHRpb25zXV0uIE5vIGRlZmF1bHRzIGFyZSBzZXRcbiAgICogdXNpbmcgdGhpcyBsaWJyYXJ5LCBpbnN0ZWFkIHRoZSBkZWZhdWx0cyBhcmUgc2V0IGJ5IHRoZSBHb29nbGUgTWFwc1xuICAgKiBKYXZhU2NyaXB0IEFQSSBzZXJ2ZXIuXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBsb2FkZXIgPSBMb2FkZXIoe2FwaUtleSwgdmVyc2lvbjogJ3dlZWtseScsIGxpYnJhcmllczogWydwbGFjZXMnXX0pO1xuICAgKiBgYGBcbiAgICovXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBhcGlLZXksXG4gICAgYXV0aFJlZmVycmVyUG9saWN5LFxuICAgIGNoYW5uZWwsXG4gICAgY2xpZW50LFxuICAgIGlkID0gREVGQVVMVF9JRCxcbiAgICBsYW5ndWFnZSxcbiAgICBsaWJyYXJpZXMgPSBbXSxcbiAgICBtYXBJZHMsXG4gICAgbm9uY2UsXG4gICAgcmVnaW9uLFxuICAgIHJldHJpZXMgPSAzLFxuICAgIHVybCA9IFwiaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzXCIsXG4gICAgdmVyc2lvbixcbiAgfTogTG9hZGVyT3B0aW9ucykge1xuICAgIHRoaXMuYXBpS2V5ID0gYXBpS2V5O1xuICAgIHRoaXMuYXV0aFJlZmVycmVyUG9saWN5ID0gYXV0aFJlZmVycmVyUG9saWN5O1xuICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgdGhpcy5jbGllbnQgPSBjbGllbnQ7XG4gICAgdGhpcy5pZCA9IGlkIHx8IERFRkFVTFRfSUQ7IC8vIERvIG5vdCBhbGxvdyBlbXB0eSBzdHJpbmdcbiAgICB0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgdGhpcy5saWJyYXJpZXMgPSBsaWJyYXJpZXM7XG4gICAgdGhpcy5tYXBJZHMgPSBtYXBJZHM7XG4gICAgdGhpcy5ub25jZSA9IG5vbmNlO1xuICAgIHRoaXMucmVnaW9uID0gcmVnaW9uO1xuICAgIHRoaXMucmV0cmllcyA9IHJldHJpZXM7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvbjtcblxuICAgIGlmIChMb2FkZXIuaW5zdGFuY2UpIHtcbiAgICAgIGlmICghaXNFcXVhbCh0aGlzLm9wdGlvbnMsIExvYWRlci5pbnN0YW5jZS5vcHRpb25zKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYExvYWRlciBtdXN0IG5vdCBiZSBjYWxsZWQgYWdhaW4gd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy4gJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1xuICAgICAgICAgICl9ICE9PSAke0pTT04uc3RyaW5naWZ5KExvYWRlci5pbnN0YW5jZS5vcHRpb25zKX1gXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBMb2FkZXIuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgTG9hZGVyLmluc3RhbmNlID0gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBnZXQgb3B0aW9ucygpOiBMb2FkZXJPcHRpb25zIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLFxuICAgICAgYXBpS2V5OiB0aGlzLmFwaUtleSxcbiAgICAgIGNoYW5uZWw6IHRoaXMuY2hhbm5lbCxcbiAgICAgIGNsaWVudDogdGhpcy5jbGllbnQsXG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGxpYnJhcmllczogdGhpcy5saWJyYXJpZXMsXG4gICAgICBsYW5ndWFnZTogdGhpcy5sYW5ndWFnZSxcbiAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24sXG4gICAgICBtYXBJZHM6IHRoaXMubWFwSWRzLFxuICAgICAgbm9uY2U6IHRoaXMubm9uY2UsXG4gICAgICB1cmw6IHRoaXMudXJsLFxuICAgICAgYXV0aFJlZmVycmVyUG9saWN5OiB0aGlzLmF1dGhSZWZlcnJlclBvbGljeSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGdldCBzdGF0dXMoKTogTG9hZGVyU3RhdHVzIHtcbiAgICBpZiAodGhpcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gTG9hZGVyU3RhdHVzLkZBSUxVUkU7XG4gICAgfVxuICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgIHJldHVybiBMb2FkZXJTdGF0dXMuU1VDQ0VTUztcbiAgICB9XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuIExvYWRlclN0YXR1cy5MT0FESU5HO1xuICAgIH1cbiAgICByZXR1cm4gTG9hZGVyU3RhdHVzLklOSVRJQUxJWkVEO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZmFpbGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmRvbmUgJiYgIXRoaXMubG9hZGluZyAmJiB0aGlzLmVycm9ycy5sZW5ndGggPj0gdGhpcy5yZXRyaWVzICsgMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVVcmwgcmV0dXJucyB0aGUgR29vZ2xlIE1hcHMgSmF2YVNjcmlwdCBBUEkgc2NyaXB0IHVybCBnaXZlbiB0aGUgW1tMb2FkZXJPcHRpb25zXV0uXG4gICAqXG4gICAqIEBpZ25vcmVcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIHB1YmxpYyBjcmVhdGVVcmwoKTogc3RyaW5nIHtcbiAgICBsZXQgdXJsID0gdGhpcy51cmw7XG5cbiAgICB1cmwgKz0gYD9jYWxsYmFjaz1fX2dvb2dsZU1hcHNDYWxsYmFjayZsb2FkaW5nPWFzeW5jYDtcblxuICAgIGlmICh0aGlzLmFwaUtleSkge1xuICAgICAgdXJsICs9IGAma2V5PSR7dGhpcy5hcGlLZXl9YDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFubmVsKSB7XG4gICAgICB1cmwgKz0gYCZjaGFubmVsPSR7dGhpcy5jaGFubmVsfWA7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2xpZW50KSB7XG4gICAgICB1cmwgKz0gYCZjbGllbnQ9JHt0aGlzLmNsaWVudH1gO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxpYnJhcmllcy5sZW5ndGggPiAwKSB7XG4gICAgICB1cmwgKz0gYCZsaWJyYXJpZXM9JHt0aGlzLmxpYnJhcmllcy5qb2luKFwiLFwiKX1gO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxhbmd1YWdlKSB7XG4gICAgICB1cmwgKz0gYCZsYW5ndWFnZT0ke3RoaXMubGFuZ3VhZ2V9YDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWdpb24pIHtcbiAgICAgIHVybCArPSBgJnJlZ2lvbj0ke3RoaXMucmVnaW9ufWA7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudmVyc2lvbikge1xuICAgICAgdXJsICs9IGAmdj0ke3RoaXMudmVyc2lvbn1gO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm1hcElkcykge1xuICAgICAgdXJsICs9IGAmbWFwX2lkcz0ke3RoaXMubWFwSWRzLmpvaW4oXCIsXCIpfWA7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYXV0aFJlZmVycmVyUG9saWN5KSB7XG4gICAgICB1cmwgKz0gYCZhdXRoX3JlZmVycmVyX3BvbGljeT0ke3RoaXMuYXV0aFJlZmVycmVyUG9saWN5fWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVTY3JpcHQoKTogdm9pZCB7XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCk7XG4gICAgaWYgKHNjcmlwdCkge1xuICAgICAgc2NyaXB0LnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHRoZSBHb29nbGUgTWFwcyBKYXZhU2NyaXB0IEFQSSBzY3JpcHQgYW5kIHJldHVybiBhIFByb21pc2UuXG4gICAqIEBkZXByZWNhdGVkLCB1c2UgaW1wb3J0TGlicmFyeSgpIGluc3RlYWQuXG4gICAqL1xuICBwdWJsaWMgbG9hZCgpOiBQcm9taXNlPHR5cGVvZiBnb29nbGU+IHtcbiAgICByZXR1cm4gdGhpcy5sb2FkUHJvbWlzZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIEdvb2dsZSBNYXBzIEphdmFTY3JpcHQgQVBJIHNjcmlwdCBhbmQgcmV0dXJuIGEgUHJvbWlzZS5cbiAgICpcbiAgICogQGlnbm9yZVxuICAgKiBAZGVwcmVjYXRlZCwgdXNlIGltcG9ydExpYnJhcnkoKSBpbnN0ZWFkLlxuICAgKi9cbiAgcHVibGljIGxvYWRQcm9taXNlKCk6IFByb21pc2U8dHlwZW9mIGdvb2dsZT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmxvYWRDYWxsYmFjaygoZXJyOiBFcnJvckV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgcmVzb2x2ZSh3aW5kb3cuZ29vZ2xlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QoZXJyLmVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L3JlZmVyZW5jZS90b3AtbGV2ZWwjZ29vZ2xlLm1hcHMuaW1wb3J0TGlicmFyeVxuICAgKi9cbiAgcHVibGljIGltcG9ydExpYnJhcnkobmFtZTogXCJjb3JlXCIpOiBQcm9taXNlPGdvb2dsZS5tYXBzLkNvcmVMaWJyYXJ5PjtcbiAgcHVibGljIGltcG9ydExpYnJhcnkobmFtZTogXCJtYXBzXCIpOiBQcm9taXNlPGdvb2dsZS5tYXBzLk1hcHNMaWJyYXJ5PjtcbiAgcHVibGljIGltcG9ydExpYnJhcnkobmFtZTogXCJwbGFjZXNcIik6IFByb21pc2U8Z29vZ2xlLm1hcHMuUGxhY2VzTGlicmFyeT47XG4gIHB1YmxpYyBpbXBvcnRMaWJyYXJ5KFxuICAgIG5hbWU6IFwiZ2VvY29kaW5nXCJcbiAgKTogUHJvbWlzZTxnb29nbGUubWFwcy5HZW9jb2RpbmdMaWJyYXJ5PjtcbiAgcHVibGljIGltcG9ydExpYnJhcnkobmFtZTogXCJyb3V0ZXNcIik6IFByb21pc2U8Z29vZ2xlLm1hcHMuUm91dGVzTGlicmFyeT47XG4gIHB1YmxpYyBpbXBvcnRMaWJyYXJ5KG5hbWU6IFwibWFya2VyXCIpOiBQcm9taXNlPGdvb2dsZS5tYXBzLk1hcmtlckxpYnJhcnk+O1xuICBwdWJsaWMgaW1wb3J0TGlicmFyeShuYW1lOiBcImdlb21ldHJ5XCIpOiBQcm9taXNlPGdvb2dsZS5tYXBzLkdlb21ldHJ5TGlicmFyeT47XG4gIHB1YmxpYyBpbXBvcnRMaWJyYXJ5KFxuICAgIG5hbWU6IFwiZWxldmF0aW9uXCJcbiAgKTogUHJvbWlzZTxnb29nbGUubWFwcy5FbGV2YXRpb25MaWJyYXJ5PjtcbiAgcHVibGljIGltcG9ydExpYnJhcnkoXG4gICAgbmFtZTogXCJzdHJlZXRWaWV3XCJcbiAgKTogUHJvbWlzZTxnb29nbGUubWFwcy5TdHJlZXRWaWV3TGlicmFyeT47XG4gIHB1YmxpYyBpbXBvcnRMaWJyYXJ5KFxuICAgIG5hbWU6IFwiam91cm5leVNoYXJpbmdcIlxuICApOiBQcm9taXNlPGdvb2dsZS5tYXBzLkpvdXJuZXlTaGFyaW5nTGlicmFyeT47XG4gIHB1YmxpYyBpbXBvcnRMaWJyYXJ5KG5hbWU6IFwiZHJhd2luZ1wiKTogUHJvbWlzZTxnb29nbGUubWFwcy5EcmF3aW5nTGlicmFyeT47XG4gIHB1YmxpYyBpbXBvcnRMaWJyYXJ5KFxuICAgIG5hbWU6IFwidmlzdWFsaXphdGlvblwiXG4gICk6IFByb21pc2U8Z29vZ2xlLm1hcHMuVmlzdWFsaXphdGlvbkxpYnJhcnk+O1xuICBwdWJsaWMgaW1wb3J0TGlicmFyeShuYW1lOiBMaWJyYXJ5KTogUHJvbWlzZTx1bmtub3duPjtcbiAgcHVibGljIGltcG9ydExpYnJhcnkobmFtZTogTGlicmFyeSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIHRoaXMuZXhlY3V0ZSgpO1xuICAgIHJldHVybiBnb29nbGUubWFwcy5pbXBvcnRMaWJyYXJ5KG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIEdvb2dsZSBNYXBzIEphdmFTY3JpcHQgQVBJIHNjcmlwdCB3aXRoIGEgY2FsbGJhY2suXG4gICAqIEBkZXByZWNhdGVkLCB1c2UgaW1wb3J0TGlicmFyeSgpIGluc3RlYWQuXG4gICAqL1xuICBwdWJsaWMgbG9hZENhbGxiYWNrKGZuOiAoZTogRXJyb3JFdmVudCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goZm4pO1xuICAgIHRoaXMuZXhlY3V0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc2NyaXB0IG9uIGRvY3VtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBzZXRTY3JpcHQoKTogdm9pZCB7XG4gICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpKSB7XG4gICAgICAvLyBUT0RPIHdyYXAgb25lcnJvciBjYWxsYmFjayBmb3IgY2FzZXMgd2hlcmUgdGhlIHNjcmlwdCB3YXMgbG9hZGVkIGVsc2V3aGVyZVxuICAgICAgdGhpcy5jYWxsYmFjaygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGtleTogdGhpcy5hcGlLZXksXG4gICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWwsXG4gICAgICBjbGllbnQ6IHRoaXMuY2xpZW50LFxuICAgICAgbGlicmFyaWVzOiB0aGlzLmxpYnJhcmllcy5sZW5ndGggJiYgdGhpcy5saWJyYXJpZXMsXG4gICAgICB2OiB0aGlzLnZlcnNpb24sXG4gICAgICBtYXBJZHM6IHRoaXMubWFwSWRzLFxuICAgICAgbGFuZ3VhZ2U6IHRoaXMubGFuZ3VhZ2UsXG4gICAgICByZWdpb246IHRoaXMucmVnaW9uLFxuICAgICAgYXV0aFJlZmVycmVyUG9saWN5OiB0aGlzLmF1dGhSZWZlcnJlclBvbGljeSxcbiAgICB9O1xuICAgIC8vIGtlZXAgdGhlIFVSTCBtaW5pbWFsOlxuICAgIE9iamVjdC5rZXlzKHBhcmFtcykuZm9yRWFjaChcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAoa2V5KSA9PiAhKHBhcmFtcyBhcyBhbnkpW2tleV0gJiYgZGVsZXRlIChwYXJhbXMgYXMgYW55KVtrZXldXG4gICAgKTtcblxuICAgIGlmICghd2luZG93Py5nb29nbGU/Lm1hcHM/LmltcG9ydExpYnJhcnkpIHtcbiAgICAgIC8vIHR3ZWFrZWQgY29weSBvZiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9sb2FkLW1hcHMtanMtYXBpI2R5bmFtaWMtbGlicmFyeS1pbXBvcnRcbiAgICAgIC8vIHdoaWNoIGFsc28gc2V0cyB0aGUgYmFzZSB1cmwsIHRoZSBpZCwgYW5kIHRoZSBub25jZVxuICAgICAgLyogZXNsaW50LWRpc2FibGUgKi9cbiAgICAgICgoZykgPT4ge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGxldCBoLFxuICAgICAgICAgIGEsXG4gICAgICAgICAgayxcbiAgICAgICAgICBwID0gXCJUaGUgR29vZ2xlIE1hcHMgSmF2YVNjcmlwdCBBUElcIixcbiAgICAgICAgICBjID0gXCJnb29nbGVcIixcbiAgICAgICAgICBsID0gXCJpbXBvcnRMaWJyYXJ5XCIsXG4gICAgICAgICAgcSA9IFwiX19pYl9fXCIsXG4gICAgICAgICAgbSA9IGRvY3VtZW50LFxuICAgICAgICAgIGIgPSB3aW5kb3c7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgYiA9IGJbY10gfHwgKGJbY10gPSB7fSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3QgZCA9IGIubWFwcyB8fCAoYi5tYXBzID0ge30pLFxuICAgICAgICAgIHIgPSBuZXcgU2V0KCksXG4gICAgICAgICAgZSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKSxcbiAgICAgICAgICB1ID0gKCkgPT5cbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGggfHwgKGggPSBuZXcgUHJvbWlzZShhc3luYyAoZiwgbikgPT4ge1xuICAgICAgICAgICAgICBhd2FpdCAoYSA9IG0uY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKSk7XG4gICAgICAgICAgICAgIGEuaWQgPSB0aGlzLmlkO1xuICAgICAgICAgICAgICBlLnNldChcImxpYnJhcmllc1wiLCBbLi4ucl0gKyBcIlwiKTtcbiAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICBmb3IgKGsgaW4gZykgZS5zZXQoay5yZXBsYWNlKC9bQS1aXS9nLCAodCkgPT4gXCJfXCIgKyB0WzBdLnRvTG93ZXJDYXNlKCkpLCBnW2tdKTtcbiAgICAgICAgICAgICAgZS5zZXQoXCJjYWxsYmFja1wiLCBjICsgXCIubWFwcy5cIiArIHEpO1xuICAgICAgICAgICAgICBhLnNyYyA9IHRoaXMudXJsICsgYD9gICsgZTtcbiAgICAgICAgICAgICAgZFtxXSA9IGY7XG4gICAgICAgICAgICAgIGEub25lcnJvciA9ICgpID0+IChoID0gbihFcnJvcihwICsgXCIgY291bGQgbm90IGxvYWQuXCIpKSk7XG4gICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgYS5ub25jZSA9IHRoaXMubm9uY2UgfHwgbS5xdWVyeVNlbGVjdG9yKFwic2NyaXB0W25vbmNlXVwiKT8ubm9uY2UgfHwgXCJcIjtcbiAgICAgICAgICAgICAgbS5oZWFkLmFwcGVuZChhKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBkW2xdID8gY29uc29sZS53YXJuKHAgKyBcIiBvbmx5IGxvYWRzIG9uY2UuIElnbm9yaW5nOlwiLCBnKSA6IChkW2xdID0gKGYsIC4uLm4pID0+IHIuYWRkKGYpICYmIHUoKS50aGVuKCgpID0+IGRbbF0oZiwgLi4ubikpKTtcbiAgICAgIH0pKHBhcmFtcyk7XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlICovXG4gICAgfVxuXG4gICAgLy8gV2hpbGUgbW9zdCBsaWJyYXJpZXMgcG9wdWxhdGUgdGhlIGdsb2JhbCBuYW1lc3BhY2Ugd2hlbiBsb2FkZWQgdmlhIGJvb3RzdHJhcCBwYXJhbXMsXG4gICAgLy8gdGhpcyBpcyBub3QgdGhlIGNhc2UgZm9yIFwibWFya2VyXCIgd2hlbiB1c2VkIHdpdGggdGhlIGlubGluZSBib290c3RyYXAgbG9hZGVyXG4gICAgLy8gKGFuZCBtYXliZSBvdGhlcnMgaW4gdGhlIGZ1dHVyZSkuIFNvIGVuc3VyZSB0aGVyZSBpcyBhbiBpbXBvcnRMaWJyYXJ5IGZvciBlYWNoOlxuICAgIGNvbnN0IGxpYnJhcnlQcm9taXNlcyA9IHRoaXMubGlicmFyaWVzLm1hcCgobGlicmFyeSkgPT5cbiAgICAgIHRoaXMuaW1wb3J0TGlicmFyeShsaWJyYXJ5KVxuICAgICk7XG4gICAgLy8gZW5zdXJlIGF0IGxlYXN0IG9uZSBsaWJyYXJ5LCB0byBraWNrIG9mZiBsb2FkaW5nLi4uXG4gICAgaWYgKCFsaWJyYXJ5UHJvbWlzZXMubGVuZ3RoKSB7XG4gICAgICBsaWJyYXJ5UHJvbWlzZXMucHVzaCh0aGlzLmltcG9ydExpYnJhcnkoXCJjb3JlXCIpKTtcbiAgICB9XG4gICAgUHJvbWlzZS5hbGwobGlicmFyeVByb21pc2VzKS50aGVuKFxuICAgICAgKCkgPT4gdGhpcy5jYWxsYmFjaygpLFxuICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IEVycm9yRXZlbnQoXCJlcnJvclwiLCB7IGVycm9yIH0pOyAvLyBmb3IgYmFja3dhcmRzIGNvbXBhdFxuICAgICAgICB0aGlzLmxvYWRFcnJvckNhbGxiYWNrKGV2ZW50KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBsb2FkZXIgc3RhdGUuXG4gICAqL1xuICBwcml2YXRlIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuZGVsZXRlU2NyaXB0KCk7XG4gICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICB0aGlzLm9uZXJyb3JFdmVudCA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIHJlc2V0SWZSZXRyeWluZ0ZhaWxlZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5mYWlsZWQpIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGxvYWRFcnJvckNhbGxiYWNrKGU6IEVycm9yRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKGUpO1xuXG4gICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA8PSB0aGlzLnJldHJpZXMpIHtcbiAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5lcnJvcnMubGVuZ3RoICogMiAqKiB0aGlzLmVycm9ycy5sZW5ndGg7XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGBGYWlsZWQgdG8gbG9hZCBHb29nbGUgTWFwcyBzY3JpcHQsIHJldHJ5aW5nIGluICR7ZGVsYXl9IG1zLmBcbiAgICAgICk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmRlbGV0ZVNjcmlwdCgpO1xuICAgICAgICB0aGlzLnNldFNjcmlwdCgpO1xuICAgICAgfSwgZGVsYXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uZXJyb3JFdmVudCA9IGU7XG4gICAgICB0aGlzLmNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjYWxsYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5jYWxsYmFja3MuZm9yRWFjaCgoY2IpID0+IHtcbiAgICAgIGNiKHRoaXMub25lcnJvckV2ZW50KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gIH1cblxuICBwcml2YXRlIGV4ZWN1dGUoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNldElmUmV0cnlpbmdGYWlsZWQoKTtcblxuICAgIGlmICh0aGlzLmxvYWRpbmcpIHtcbiAgICAgIC8vIGRvIG5vdGhpbmcgYnV0IHdhaXRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNob3J0IGNpcmN1aXQgYW5kIHdhcm4gaWYgZ29vZ2xlLm1hcHMgaXMgYWxyZWFkeSBsb2FkZWRcbiAgICAgIGlmICh3aW5kb3cuZ29vZ2xlICYmIHdpbmRvdy5nb29nbGUubWFwcyAmJiB3aW5kb3cuZ29vZ2xlLm1hcHMudmVyc2lvbikge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgXCJHb29nbGUgTWFwcyBhbHJlYWR5IGxvYWRlZCBvdXRzaWRlIEBnb29nbGVtYXBzL2pzLWFwaS1sb2FkZXIuIFwiICtcbiAgICAgICAgICAgIFwiVGhpcyBtYXkgcmVzdWx0IGluIHVuZGVzaXJhYmxlIGJlaGF2aW9yIGFzIG9wdGlvbnMgYW5kIHNjcmlwdCBwYXJhbWV0ZXJzIG1heSBub3QgbWF0Y2guXCJcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjaygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgICB0aGlzLnNldFNjcmlwdCgpO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IExvYWRlciB9IGZyb20gJ0Bnb29nbGVtYXBzL2pzLWFwaS1sb2FkZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvY2F0aW9uUGlja3JFbnRyeSh7IGxvY2F0aW9uLCBjb25maWcgfSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG1hcDogbnVsbCxcbiAgICAgICAgbWFya2VyOiBudWxsLFxuICAgICAgICBtYXJrZXJMb2NhdGlvbjogbnVsbCxcbiAgICAgICAgbG9hZGVyOiBudWxsLFxuICAgICAgICBsb2NhdGlvbjogbnVsbCxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICBkZWZhdWx0TG9jYXRpb246IHtcbiAgICAgICAgICAgICAgICBsYXQ6IDAsXG4gICAgICAgICAgICAgICAgbG5nOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlZmF1bHRab29tOiA4LFxuICAgICAgICAgICAgYXBpS2V5OiAnJyxcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb25cbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0geyAuLi50aGlzLmNvbmZpZywgLi4uY29uZmlnIH1cbiAgICAgICAgICAgIHRoaXMubG9hZEdtYXBzKClcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkR21hcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZGVyID0gbmV3IExvYWRlcih7XG4gICAgICAgICAgICAgICAgYXBpS2V5OiB0aGlzLmNvbmZpZy5hcGlLZXksXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogJ3dlZWtseScsXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB0aGlzLmxvYWRlclxuICAgICAgICAgICAgICAgIC5sb2FkKClcbiAgICAgICAgICAgICAgICAudGhlbigoZ29vZ2xlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLiRyZWZzLm1hcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiB0aGlzLmdldENvb3JkaW5hdGVzKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiB0aGlzLmNvbmZpZy5kZWZhdWx0Wm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnRoaXMuY29uZmlnLmNvbnRyb2xzLFxuICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IHRoaXMubWFwLFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRQb3NpdGlvbih0aGlzLmdldENvb3JkaW5hdGVzKCkpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxvYWRpbmcgR29vZ2xlIE1hcHMgQVBJOicsIGVycm9yKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29vcmRpbmF0ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBsb2NhdGlvbiA9IEpTT04ucGFyc2UodGhpcy5sb2NhdGlvbilcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgIWxvY2F0aW9uLmhhc093blByb3BlcnR5KCdsYXQnKSB8fFxuICAgICAgICAgICAgICAgICFsb2NhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnbG5nJylcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBsYXQ6IHRoaXMuY29uZmlnLmRlZmF1bHRMb2NhdGlvbi5sYXQsXG4gICAgICAgICAgICAgICAgICAgIGxuZzogdGhpcy5jb25maWcuZGVmYXVsdExvY2F0aW9uLmxuZyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBsb2NhdGlvblxuICAgICAgICB9LFxuICAgIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFrSE8sU0FBUyxVQUFVLFNBQVMsWUFBWSxHQUFHLFdBQVc7QUFDekQsV0FBUyxNQUFNLE9BQU87QUFBRSxXQUFPLGlCQUFpQixJQUFJLFFBQVEsSUFBSSxFQUFFLFNBQVUsU0FBUztBQUFFLGNBQVEsS0FBSztJQUFFLENBQUU7RUFBRTtBQUMxRyxTQUFPLEtBQUssTUFBTSxJQUFJLFVBQVUsU0FBVSxTQUFTLFFBQVE7QUFDdkQsYUFBUyxVQUFVLE9BQU87QUFBRSxVQUFJO0FBQUUsYUFBSyxVQUFVLEtBQUssS0FBSyxDQUFDO01BQUUsU0FBVSxHQUFHO0FBQUUsZUFBTyxDQUFDO01BQUU7SUFBRTtBQUN6RixhQUFTLFNBQVMsT0FBTztBQUFFLFVBQUk7QUFBRSxhQUFLLFVBQVUsT0FBTyxFQUFFLEtBQUssQ0FBQztNQUFFLFNBQVUsR0FBRztBQUFFLGVBQU8sQ0FBQztNQUFFO0lBQUU7QUFDNUYsYUFBUyxLQUFLLFFBQVE7QUFBRSxhQUFPLE9BQU8sUUFBUSxPQUFPLEtBQUssSUFBSSxNQUFNLE9BQU8sS0FBSyxFQUFFLEtBQUssV0FBVyxRQUFRO0lBQUU7QUFDNUcsVUFBTSxZQUFZLFVBQVUsTUFBTSxTQUFTLGNBQWMsQ0FBQSxDQUFFLEdBQUcsS0FBSSxDQUFFO0VBQzVFLENBQUs7QUFDTDs7OztBQ3BIQSxJQUFBLGdCQUFpQixTQUFTLE1BQU0sR0FBRyxHQUFHO0FBQ3BDLE1BQUksTUFBTTtBQUFHLFdBQU87QUFFcEIsTUFBSSxLQUFLLEtBQUssT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVU7QUFDMUQsUUFBSSxFQUFFLGdCQUFnQixFQUFFO0FBQWEsYUFBTztBQUU1QyxRQUFJLFFBQVEsR0FBRztBQUNmLFFBQUksTUFBTSxRQUFRLENBQUMsR0FBRztBQUNwQixlQUFTLEVBQUU7QUFDWCxVQUFJLFVBQVUsRUFBRTtBQUFRLGVBQU87QUFDL0IsV0FBSyxJQUFJLFFBQVEsUUFBUTtBQUN2QixZQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUFHLGlCQUFPO0FBQ2pDLGFBQU87SUFDYjtBQUlJLFFBQUksRUFBRSxnQkFBZ0I7QUFBUSxhQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUU7QUFDNUUsUUFBSSxFQUFFLFlBQVksT0FBTyxVQUFVO0FBQVMsYUFBTyxFQUFFLFFBQU8sTUFBTyxFQUFFLFFBQU87QUFDNUUsUUFBSSxFQUFFLGFBQWEsT0FBTyxVQUFVO0FBQVUsYUFBTyxFQUFFLFNBQVEsTUFBTyxFQUFFLFNBQVE7QUFFaEYsV0FBTyxPQUFPLEtBQUssQ0FBQztBQUNwQixhQUFTLEtBQUs7QUFDZCxRQUFJLFdBQVcsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUFRLGFBQU87QUFFN0MsU0FBSyxJQUFJLFFBQVEsUUFBUTtBQUN2QixVQUFJLENBQUMsT0FBTyxVQUFVLGVBQWUsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQUcsZUFBTztBQUVoRSxTQUFLLElBQUksUUFBUSxRQUFRLEtBQUk7QUFDM0IsVUFBSSxNQUFNLEtBQUssQ0FBQztBQUVoQixVQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUFHLGVBQU87SUFDekM7QUFFSSxXQUFPO0VBQ1g7QUFHRSxTQUFPLE1BQUksS0FBSyxNQUFJO0FBQ3RCOztBQzNCTyxJQUFNLGFBQWE7SUFxS2Q7Q0FBWixTQUFZQSxlQUFZO0FBQ3RCLEVBQUFBLGNBQUFBLGNBQUEsYUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLEVBQUFBLGNBQUFBLGNBQUEsU0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLEVBQUFBLGNBQUFBLGNBQUEsU0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLEVBQUFBLGNBQUFBLGNBQUEsU0FBQSxJQUFBLENBQUEsSUFBQTtBQUNGLEdBTFksaUJBQUEsZUFLWCxDQUFBLEVBQUE7SUFxQlksZUFBQSxRQUFNOzs7Ozs7Ozs7O0VBMkVqQixZQUFZLEVBQ1YsUUFDQSxvQkFDQSxTQUNBLFFBQ0EsS0FBSyxZQUNMLFVBQ0EsWUFBWSxDQUFBLEdBQ1osUUFDQSxPQUNBLFFBQ0EsVUFBVSxHQUNWLE1BQU0sMkNBQ04sUUFBTyxHQUNPO0FBN0JSLFNBQVMsWUFBZ0MsQ0FBQTtBQUN6QyxTQUFJLE9BQUc7QUFDUCxTQUFPLFVBQUc7QUFFVixTQUFNLFNBQWlCLENBQUE7QUEwQjdCLFNBQUssU0FBUztBQUNkLFNBQUsscUJBQXFCO0FBQzFCLFNBQUssVUFBVTtBQUNmLFNBQUssU0FBUztBQUNkLFNBQUssS0FBSyxNQUFNO0FBQ2hCLFNBQUssV0FBVztBQUNoQixTQUFLLFlBQVk7QUFDakIsU0FBSyxTQUFTO0FBQ2QsU0FBSyxRQUFRO0FBQ2IsU0FBSyxTQUFTO0FBQ2QsU0FBSyxVQUFVO0FBQ2YsU0FBSyxNQUFNO0FBQ1gsU0FBSyxVQUFVO0FBRWYsUUFBSSxRQUFPLFVBQVU7QUFDbkIsVUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLFFBQU8sU0FBUyxPQUFPLEdBQUc7QUFDbkQsY0FBTSxJQUFJLE1BQ1IsMkRBQTJELEtBQUssVUFDOUQsS0FBSyxPQUFPLENBQ2IsUUFBUSxLQUFLLFVBQVUsUUFBTyxTQUFTLE9BQU8sQ0FBQyxFQUFFOztBQUl0RCxhQUFPLFFBQU87O0FBR2hCLFlBQU8sV0FBVzs7RUFHcEIsSUFBVyxVQUFPO0FBQ2hCLFdBQU87TUFDTCxTQUFTLEtBQUs7TUFDZCxRQUFRLEtBQUs7TUFDYixTQUFTLEtBQUs7TUFDZCxRQUFRLEtBQUs7TUFDYixJQUFJLEtBQUs7TUFDVCxXQUFXLEtBQUs7TUFDaEIsVUFBVSxLQUFLO01BQ2YsUUFBUSxLQUFLO01BQ2IsUUFBUSxLQUFLO01BQ2IsT0FBTyxLQUFLO01BQ1osS0FBSyxLQUFLO01BQ1Ysb0JBQW9CLEtBQUs7OztFQUk3QixJQUFXLFNBQU07QUFDZixRQUFJLEtBQUssT0FBTyxRQUFRO0FBQ3RCLGFBQU8sYUFBYTs7QUFFdEIsUUFBSSxLQUFLLE1BQU07QUFDYixhQUFPLGFBQWE7O0FBRXRCLFFBQUksS0FBSyxTQUFTO0FBQ2hCLGFBQU8sYUFBYTs7QUFFdEIsV0FBTyxhQUFhOztFQUd0QixJQUFZLFNBQU07QUFDaEIsV0FBTyxLQUFLLFFBQVEsQ0FBQyxLQUFLLFdBQVcsS0FBSyxPQUFPLFVBQVUsS0FBSyxVQUFVOzs7Ozs7OztFQVNyRSxZQUFTO0FBQ2QsUUFBSSxNQUFNLEtBQUs7QUFFZixXQUFPO0FBRVAsUUFBSSxLQUFLLFFBQVE7QUFDZixhQUFPLFFBQVEsS0FBSyxNQUFNOztBQUc1QixRQUFJLEtBQUssU0FBUztBQUNoQixhQUFPLFlBQVksS0FBSyxPQUFPOztBQUdqQyxRQUFJLEtBQUssUUFBUTtBQUNmLGFBQU8sV0FBVyxLQUFLLE1BQU07O0FBRy9CLFFBQUksS0FBSyxVQUFVLFNBQVMsR0FBRztBQUM3QixhQUFPLGNBQWMsS0FBSyxVQUFVLEtBQUssR0FBRyxDQUFDOztBQUcvQyxRQUFJLEtBQUssVUFBVTtBQUNqQixhQUFPLGFBQWEsS0FBSyxRQUFROztBQUduQyxRQUFJLEtBQUssUUFBUTtBQUNmLGFBQU8sV0FBVyxLQUFLLE1BQU07O0FBRy9CLFFBQUksS0FBSyxTQUFTO0FBQ2hCLGFBQU8sTUFBTSxLQUFLLE9BQU87O0FBRzNCLFFBQUksS0FBSyxRQUFRO0FBQ2YsYUFBTyxZQUFZLEtBQUssT0FBTyxLQUFLLEdBQUcsQ0FBQzs7QUFHMUMsUUFBSSxLQUFLLG9CQUFvQjtBQUMzQixhQUFPLHlCQUF5QixLQUFLLGtCQUFrQjs7QUFHekQsV0FBTzs7RUFHRixlQUFZO0FBQ2pCLFVBQU0sU0FBUyxTQUFTLGVBQWUsS0FBSyxFQUFFO0FBQzlDLFFBQUksUUFBUTtBQUNWLGFBQU8sT0FBTTs7Ozs7OztFQVFWLE9BQUk7QUFDVCxXQUFPLEtBQUssWUFBVzs7Ozs7Ozs7RUFTbEIsY0FBVztBQUNoQixXQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVTtBQUNyQyxXQUFLLGFBQWEsQ0FBQyxRQUFtQjtBQUNwQyxZQUFJLENBQUMsS0FBSztBQUNSLGtCQUFRLE9BQU8sTUFBTTtlQUNoQjtBQUNMLGlCQUFPLElBQUksS0FBSzs7TUFFcEIsQ0FBQztJQUNILENBQUM7O0VBNkJJLGNBQWMsTUFBYTtBQUNoQyxTQUFLLFFBQU87QUFDWixXQUFPLE9BQU8sS0FBSyxjQUFjLElBQUk7Ozs7OztFQU9oQyxhQUFhLElBQTJCO0FBQzdDLFNBQUssVUFBVSxLQUFLLEVBQUU7QUFDdEIsU0FBSyxRQUFPOzs7OztFQU1OLFlBQVM7O0FBQ2YsUUFBSSxTQUFTLGVBQWUsS0FBSyxFQUFFLEdBQUc7QUFFcEMsV0FBSyxTQUFRO0FBQ2I7O0FBR0YsVUFBTSxTQUFTO01BQ2IsS0FBSyxLQUFLO01BQ1YsU0FBUyxLQUFLO01BQ2QsUUFBUSxLQUFLO01BQ2IsV0FBVyxLQUFLLFVBQVUsVUFBVSxLQUFLO01BQ3pDLEdBQUcsS0FBSztNQUNSLFFBQVEsS0FBSztNQUNiLFVBQVUsS0FBSztNQUNmLFFBQVEsS0FBSztNQUNiLG9CQUFvQixLQUFLOztBQUczQixXQUFPLEtBQUssTUFBTSxFQUFFOztNQUVsQixDQUFDLFFBQVEsQ0FBRSxPQUFlLEdBQUcsS0FBSyxPQUFRLE9BQWUsR0FBRztJQUFDO0FBRy9ELFFBQUksR0FBQyxNQUFBLEtBQUEsV0FBTSxRQUFOLFdBQU0sU0FBQSxTQUFOLE9BQVEsWUFBUSxRQUFBLE9BQUEsU0FBQSxTQUFBLEdBQUEsVUFBSSxRQUFBLE9BQUEsU0FBQSxTQUFBLEdBQUUsZ0JBQWU7QUFJeEMsT0FBQyxDQUFDLE1BQUs7QUFFTCxZQUFJLEdBQ0YsR0FDQSxHQUNBLElBQUksa0NBQ0osSUFBSSxVQUNKLElBQUksaUJBQ0osSUFBSSxVQUNKLElBQUksVUFDSixJQUFJO0FBRU4sWUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFBO0FBRXBCLGNBQU0sSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUEsSUFDNUIsSUFBSSxvQkFBSSxJQUFHLEdBQ1gsSUFBSSxJQUFJLGdCQUFlLEdBQ3ZCLElBQUk7O1VBRUYsTUFBTSxJQUFJLElBQUksUUFBUSxDQUFPLEdBQUcsTUFBSyxVQUFBLE1BQUEsUUFBQSxRQUFBLGFBQUE7O0FBQ25DLGtCQUFPLElBQUksRUFBRSxjQUFjLFFBQVE7QUFDbkMsY0FBRSxLQUFLLEtBQUs7QUFDWixjQUFFLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFFOUIsaUJBQUssS0FBSztBQUFHLGdCQUFFLElBQUksRUFBRSxRQUFRLFVBQVUsQ0FBQyxNQUFNLE1BQU0sRUFBRSxDQUFDLEVBQUUsWUFBVyxDQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDN0UsY0FBRSxJQUFJLFlBQVksSUFBSSxXQUFXLENBQUM7QUFDbEMsY0FBRSxNQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3pCLGNBQUUsQ0FBQyxJQUFJO0FBQ1AsY0FBRSxVQUFVLE1BQU8sSUFBSSxFQUFFLE1BQU0sSUFBSSxrQkFBa0IsQ0FBQztBQUV0RCxjQUFFLFFBQVEsS0FBSyxXQUFTQyxNQUFBLEVBQUUsY0FBYyxlQUFlLE9BQUMsUUFBQUEsUUFBQSxTQUFBLFNBQUFBLElBQUUsVUFBUztBQUNuRSxjQUFFLEtBQUssT0FBTyxDQUFDO1dBQ2hCLENBQUE7O0FBRUwsVUFBRSxDQUFDLElBQUksUUFBUSxLQUFLLElBQUksK0JBQStCLENBQUMsSUFBSyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUMsRUFBRyxLQUFLLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztNQUMzSCxHQUFHLE1BQU07O0FBT1gsVUFBTSxrQkFBa0IsS0FBSyxVQUFVLElBQUksQ0FBQyxZQUMxQyxLQUFLLGNBQWMsT0FBTyxDQUFDO0FBRzdCLFFBQUksQ0FBQyxnQkFBZ0IsUUFBUTtBQUMzQixzQkFBZ0IsS0FBSyxLQUFLLGNBQWMsTUFBTSxDQUFDOztBQUVqRCxZQUFRLElBQUksZUFBZSxFQUFFLEtBQzNCLE1BQU0sS0FBSyxTQUFRLEdBQ25CLENBQUMsVUFBUztBQUNSLFlBQU0sUUFBUSxJQUFJLFdBQVcsU0FBUyxFQUFFLE1BQUssQ0FBRTtBQUMvQyxXQUFLLGtCQUFrQixLQUFLO0lBQzlCLENBQUM7Ozs7O0VBT0csUUFBSztBQUNYLFNBQUssYUFBWTtBQUNqQixTQUFLLE9BQU87QUFDWixTQUFLLFVBQVU7QUFDZixTQUFLLFNBQVMsQ0FBQTtBQUNkLFNBQUssZUFBZTs7RUFHZCx3QkFBcUI7QUFDM0IsUUFBSSxLQUFLLFFBQVE7QUFDZixXQUFLLE1BQUs7OztFQUlOLGtCQUFrQixHQUFhO0FBQ3JDLFNBQUssT0FBTyxLQUFLLENBQUM7QUFFbEIsUUFBSSxLQUFLLE9BQU8sVUFBVSxLQUFLLFNBQVM7QUFDdEMsWUFBTSxRQUFRLEtBQUssT0FBTyxTQUFTLEtBQUEsSUFBQSxHQUFLLEtBQUssT0FBTyxNQUFNO0FBRTFELGNBQVEsTUFDTixrREFBa0QsS0FBSyxNQUFNO0FBRy9ELGlCQUFXLE1BQUs7QUFDZCxhQUFLLGFBQVk7QUFDakIsYUFBSyxVQUFTO1NBQ2IsS0FBSztXQUNIO0FBQ0wsV0FBSyxlQUFlO0FBQ3BCLFdBQUssU0FBUTs7O0VBSVQsV0FBUTtBQUNkLFNBQUssT0FBTztBQUNaLFNBQUssVUFBVTtBQUVmLFNBQUssVUFBVSxRQUFRLENBQUMsT0FBTTtBQUM1QixTQUFHLEtBQUssWUFBWTtJQUN0QixDQUFDO0FBRUQsU0FBSyxZQUFZLENBQUE7O0VBR1gsVUFBTztBQUNiLFNBQUssc0JBQXFCO0FBRTFCLFFBQUksS0FBSyxTQUFTO0FBRWhCOztBQUdGLFFBQUksS0FBSyxNQUFNO0FBQ2IsV0FBSyxTQUFRO1dBQ1I7QUFFTCxVQUFJLE9BQU8sVUFBVSxPQUFPLE9BQU8sUUFBUSxPQUFPLE9BQU8sS0FBSyxTQUFTO0FBQ3JFLGdCQUFRLEtBQ04sdUpBQzJGO0FBRTdGLGFBQUssU0FBUTtBQUNiOztBQUdGLFdBQUssVUFBVTtBQUNmLFdBQUssVUFBUzs7O0FBR25COzs7QUNyb0JjLFNBQVIsbUJBQW9DLEVBQUUsVUFBVSxPQUFPLEdBQUc7QUFDN0QsU0FBTztBQUFBLElBQ0gsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsZ0JBQWdCO0FBQUEsSUFDaEIsUUFBUTtBQUFBLElBQ1IsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLE1BQ0osaUJBQWlCO0FBQUEsUUFDYixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsTUFDVDtBQUFBLE1BQ0EsYUFBYTtBQUFBLE1BQ2IsUUFBUTtBQUFBLElBQ1o7QUFBQSxJQUVBLE1BQU0sV0FBWTtBQUNkLFdBQUssV0FBVztBQUNoQixXQUFLLFNBQVMsRUFBRSxHQUFHLEtBQUssUUFBUSxHQUFHLE9BQU87QUFDMUMsV0FBSyxVQUFVO0FBQUEsSUFDbkI7QUFBQSxJQUVBLFdBQVcsV0FBWTtBQUNuQixXQUFLLFNBQVMsSUFBSSxPQUFPO0FBQUEsUUFDckIsUUFBUSxLQUFLLE9BQU87QUFBQSxRQUNwQixTQUFTO0FBQUEsTUFDYixDQUFDO0FBRUQsV0FBSyxPQUNBLEtBQUssRUFDTCxLQUFLLENBQUNDLFlBQVc7QUFDZCxhQUFLLE1BQU0sSUFBSUEsUUFBTyxLQUFLLElBQUksS0FBSyxNQUFNLEtBQUs7QUFBQSxVQUMzQyxRQUFRLEtBQUssZUFBZTtBQUFBLFVBQzVCLE1BQU0sS0FBSyxPQUFPO0FBQUEsVUFDbEIsR0FBRyxLQUFLLE9BQU87QUFBQSxRQUNuQixDQUFDO0FBRUQsYUFBSyxTQUFTLElBQUlBLFFBQU8sS0FBSyxPQUFPO0FBQUEsVUFDakMsS0FBSyxLQUFLO0FBQUEsUUFDZCxDQUFDO0FBQ0QsYUFBSyxPQUFPLFlBQVksS0FBSyxlQUFlLENBQUM7QUFBQSxNQUNqRCxDQUFDLEVBQ0EsTUFBTSxDQUFDLFVBQVU7QUFDZCxnQkFBUSxNQUFNLGtDQUFrQyxLQUFLO0FBQUEsTUFDekQsQ0FBQztBQUFBLElBQ1Q7QUFBQSxJQUVBLGdCQUFnQixXQUFZO0FBQ3hCLFVBQUlDLFlBQVcsS0FBSyxNQUFNLEtBQUssUUFBUTtBQUV2QyxVQUNJQSxjQUFhLFFBQ2IsQ0FBQ0EsVUFBUyxlQUFlLEtBQUssS0FDOUIsQ0FBQ0EsVUFBUyxlQUFlLEtBQUssR0FDaEM7QUFDRSxRQUFBQSxZQUFXO0FBQUEsVUFDUCxLQUFLLEtBQUssT0FBTyxnQkFBZ0I7QUFBQSxVQUNqQyxLQUFLLEtBQUssT0FBTyxnQkFBZ0I7QUFBQSxRQUNyQztBQUFBLE1BQ0o7QUFFQSxhQUFPQTtBQUFBLElBQ1g7QUFBQSxFQUNKO0FBQ0o7IiwKICAibmFtZXMiOiBbIkxvYWRlclN0YXR1cyIsICJfYSIsICJnb29nbGUiLCAibG9jYXRpb24iXQp9Cg==
