define(
  "cockpit/index",
  [
    "require",
    "exports",
    "module",
    "pilot/index",
    "cockpit/cli",
    "cockpit/ui/settings",
    "cockpit/ui/cli_view",
    "cockpit/commands/basic",
  ],
  function (a, b, c) {
    b.startup = function (b, c) {
      a("pilot/index"),
        a("cockpit/cli").startup(b, c),
        a("cockpit/ui/settings").startup(b, c),
        a("cockpit/ui/cli_view").startup(b, c),
        a("cockpit/commands/basic").startup(b, c);
    };
  }
),
  define(
    "cockpit/cli",
    [
      "require",
      "exports",
      "module",
      "pilot/console",
      "pilot/lang",
      "pilot/oop",
      "pilot/event_emitter",
      "pilot/types",
      "pilot/canon",
    ],
    function (a, b, c) {
      function r(a, b) {
        q.call(this, a), b && b.flags && (this.flags = b.flags);
      }
      function q(a) {
        (this.env = a), (this.commandAssignment = new o(p, this));
      }
      function o(a, b) {
        (this.param = a), (this.requisition = b), this.setValue(a.defaultValue);
      }
      function n(a, b, c, d, e, f) {
        (this.emitter = a), this.setText(b), (this.start = c), (this.end = d), (this.prefix = e), (this.suffix = f);
      }
      function m(a, b) {
        (this.status = a.status),
          (this.message = a.message),
          b ? ((this.start = b.start), (this.end = b.end)) : ((this.start = 0), (this.end = 0)),
          (this.predictions = a.predictions);
      }
      function l(a, b, c, d, e) {
        (this.status = a), (this.message = b);
        if (typeof c === "number") (this.start = c), (this.end = d), (this.predictions = e);
        else {
          var f = c;
          (this.start = f.start), (this.end = f.end), (this.predictions = f.predictions);
        }
      }
      var d = a("pilot/console"),
        e = a("pilot/lang"),
        f = a("pilot/oop"),
        g = a("pilot/event_emitter").EventEmitter,
        h = a("pilot/types"),
        i = a("pilot/types").Status,
        j = a("pilot/types").Conversion,
        k = a("pilot/canon");
      (b.startup = function (a, b) {
        k.upgradeType("command", p);
      }),
        (l.prototype = {}),
        (l.sort = function (a, b) {
          b !== undefined &&
            a.forEach(function (a) {
              a.start === n.AT_CURSOR
                ? (a.distance = 0)
                : b < a.start
                ? (a.distance = a.start - b)
                : b > a.end
                ? (a.distance = b - a.end)
                : (a.distance = 0);
            }, this),
            a.sort(function (a, c) {
              if (b !== undefined) {
                var d = a.distance - c.distance;
                if (d != 0) return d;
              }
              return c.status - a.status;
            }),
            b !== undefined &&
              a.forEach(function (a) {
                delete a.distance;
              }, this);
          return a;
        }),
        (b.Hint = l),
        f.inherits(m, l),
        (n.prototype = {
          merge: function (a) {
            if (a.emitter != this.emitter) throw new Error("Can't merge Arguments from different EventEmitters");
            return new n(
              this.emitter,
              this.text + this.suffix + a.prefix + a.text,
              this.start,
              a.end,
              this.prefix,
              a.suffix
            );
          },
          setText: function (a) {
            if (a == null) throw new Error("Illegal text for Argument: " + a);
            var b = { argument: this, oldText: this.text, text: a };
            (this.text = a), this.emitter._dispatchEvent("argumentChange", b);
          },
          toString: function () {
            return this.prefix + this.text + this.suffix;
          },
        }),
        (n.merge = function (a, b, c) {
          (b = b === undefined ? 0 : b), (c = c === undefined ? a.length : c);
          var d;
          for (var e = b; e < c; e++) {
            var f = a[e];
            d ? (d = d.merge(f)) : (d = f);
          }
          return d;
        }),
        (n.AT_CURSOR = -1),
        (o.prototype = {
          param: undefined,
          conversion: undefined,
          value: undefined,
          arg: undefined,
          value: undefined,
          setValue: function (a) {
            if (this.value !== a) {
              if (a === undefined)
                (this.value = this.param.defaultValue),
                  (this.conversion = this.param.getDefault ? this.param.getDefault() : this.param.type.getDefault()),
                  (this.arg = undefined);
              else {
                (this.value = a), (this.conversion = undefined);
                var b = a == null ? "" : this.param.type.stringify(a);
                this.arg && this.arg.setText(b);
              }
              this.requisition._assignmentChanged(this);
            }
          },
          arg: undefined,
          setArgument: function (a) {
            this.arg !== a &&
              ((this.arg = a),
              (this.conversion = this.param.type.parse(a.text)),
              (this.conversion.arg = a),
              (this.value = this.conversion.value),
              this.requisition._assignmentChanged(this));
          },
          getHint: function () {
            if (this.param.getCustomHint && this.value && this.arg) {
              var a = this.param.getCustomHint(this.value, this.arg);
              if (a) return a;
            }
            var b = "<strong>" + this.param.name + "</strong>: ";
            this.param.description &&
              ((b += this.param.description.trim()),
              b.charAt(b.length - 1) !== "." && (b += "."),
              b.charAt(b.length - 1) !== " " && (b += " "));
            var c = i.VALID,
              d = this.arg ? this.arg.start : n.AT_CURSOR,
              e = this.arg ? this.arg.end : n.AT_CURSOR,
              f;
            this.conversion &&
              ((c = this.conversion.status),
              this.conversion.message && (b += this.conversion.message),
              (f = this.conversion.predictions));
            var g = this.arg && this.arg.text !== "",
              h = this.value !== undefined || g;
            this.param.defaultValue === undefined && !h && ((c = i.INVALID), (b += "<strong>Required<strong>"));
            return new l(c, b, d, e, f);
          },
          complete: function () {
            this.conversion &&
              this.conversion.predictions &&
              this.conversion.predictions.length > 0 &&
              this.setValue(this.conversion.predictions[0]);
          },
          isPositionCaptured: function (a) {
            if (!this.arg) return !1;
            if (this.arg.start === -1) return !1;
            if (a > this.arg.end) return !1;
            if (a === this.arg.end)
              return this.conversion.status !== i.VALID || this.conversion.predictions.length !== 0;
            return !0;
          },
          decrement: function () {
            var a = this.param.type.decrement(this.value);
            a != null && this.setValue(a);
          },
          increment: function () {
            var a = this.param.type.increment(this.value);
            a != null && this.setValue(a);
          },
          toString: function () {
            return this.arg ? this.arg.toString() : "";
          },
        }),
        (b.Assignment = o);
      var p = {
        name: "__command",
        type: "command",
        description: "The command to execute",
        getCustomHint: function (a, b) {
          var c = [];
          c.push("<strong><tt> &gt; "),
            c.push(a.name),
            a.params &&
              a.params.length > 0 &&
              a.params.forEach(function (a) {
                a.defaultValue === undefined ? c.push(" [" + a.name + "]") : c.push(" <em>[" + a.name + "]</em>");
              }, this),
            c.push("</tt></strong><br/>"),
            c.push(a.description ? a.description : "(No description)"),
            c.push("<br/>"),
            a.params &&
              a.params.length > 0 &&
              (c.push("<ul>"),
              a.params.forEach(function (a) {
                c.push("<li>"),
                  c.push("<strong><tt>" + a.name + "</tt></strong>: "),
                  c.push(a.description ? a.description : "(No description)"),
                  a.defaultValue === undefined
                    ? c.push(" <em>[Required]</em>")
                    : a.defaultValue === null
                    ? c.push(" <em>[Optional]</em>")
                    : c.push(" <em>[Default: " + a.defaultValue + "]</em>"),
                  c.push("</li>");
              }, this),
              c.push("</ul>"));
          return new l(i.VALID, c.join(""), b);
        },
      };
      (q.prototype = {
        commandAssignment: undefined,
        assignmentCount: undefined,
        _assignments: undefined,
        _hints: undefined,
        _assignmentChanged: function (a) {
          a.param.name === "__command" &&
            ((this._assignments = {}),
            a.value &&
              a.value.params.forEach(function (a) {
                this._assignments[a.name] = new o(a, this);
              }, this),
            (this.assignmentCount = Object.keys(this._assignments).length),
            this._dispatchEvent("commandChange", { command: a.value }));
        },
        getAssignment: function (a) {
          var b = typeof a === "string" ? a : Object.keys(this._assignments)[a];
          return this._assignments[b];
        },
        getParameterNames: function () {
          return Object.keys(this._assignments);
        },
        cloneAssignments: function () {
          return Object.keys(this._assignments).map(function (a) {
            return this._assignments[a];
          }, this);
        },
        _updateHints: function () {
          this.getAssignments(!0).forEach(function (a) {
            this._hints.push(a.getHint());
          }, this),
            l.sort(this._hints);
        },
        getWorstHint: function () {
          return this._hints[0];
        },
        getArgsObject: function () {
          var a = {};
          this.getAssignments().forEach(function (b) {
            a[b.param.name] = b.value;
          }, this);
          return a;
        },
        getAssignments: function (a) {
          var b = [];
          a === !0 && b.push(this.commandAssignment),
            Object.keys(this._assignments).forEach(function (a) {
              b.push(this.getAssignment(a));
            }, this);
          return b;
        },
        setDefaultValues: function () {
          this.getAssignments().forEach(function (a) {
            a.setValue(undefined);
          }, this);
        },
        exec: function () {
          k.exec(this.commandAssignment.value, this.env, "cli", this.getArgsObject(), this.toCanonicalString());
        },
        toCanonicalString: function () {
          var a = [];
          a.push(this.commandAssignment.value.name),
            Object.keys(this._assignments).forEach(function (b) {
              var c = this._assignments[b],
                d = c.param.type;
              c.value !== c.param.defaultValue && (a.push(" "), a.push(d.stringify(c.value)));
            }, this);
          return a.join("");
        },
      }),
        f.implement(q.prototype, g),
        (b.Requisition = q),
        f.inherits(r, q),
        (function () {
          (r.prototype.update = function (a) {
            (this.input = a), (this._hints = []);
            var b = this._tokenize(a.typed);
            this._split(b), this.commandAssignment.value && this._assign(b), this._updateHints();
          }),
            (r.prototype.getInputStatusMarkup = function () {
              var a = this.toString()
                .split("")
                .map(function (a) {
                  return i.VALID;
                });
              this._hints.forEach(function (b) {
                for (var c = b.start; c <= b.end; c++) b.status > a[c] && (a[c] = b.status);
              }, this);
              return a;
            }),
            (r.prototype.toString = function () {
              return this.getAssignments(!0)
                .map(function (a) {
                  return a.toString();
                }, this)
                .join("");
            });
          var a = r.prototype._updateHints;
          (r.prototype._updateHints = function () {
            a.call(this);
            var b = this.input.cursor;
            this._hints.forEach(function (a) {
              var c = b.start >= a.start && b.start <= a.end,
                d = b.end >= a.start && b.end <= a.end,
                e = c || d;
              !e && a.status === i.INCOMPLETE && (a.status = i.INVALID);
            }, this),
              l.sort(this._hints);
          }),
            (r.prototype.getHints = function () {
              return this._hints;
            }),
            (r.prototype.getAssignmentAt = function (a) {
              var b = this.getAssignments(!0);
              for (var c = 0; c < b.length; c++) {
                var d = b[c];
                if (!d.arg) return d;
                if (d.isPositionCaptured(a)) return d;
              }
              return d;
            }),
            (r.prototype._tokenize = function (a) {
              function g(a) {
                return a
                  .replace(/\uF000/g, " ")
                  .replace(/\uF001/g, "'")
                  .replace(/\uF002/g, '"');
              }
              if (a == null || a.length === 0) return [new n(this, "", 0, 0, "", "")];
              var b = 1,
                c = 2,
                d = 3,
                e = 4,
                f = b;
              a = a
                .replace(/\\\\/g, "\\")
                .replace(/\\b/g, "\b")
                .replace(/\\f/g, "\f")
                .replace(/\\n/g, "\n")
                .replace(/\\r/g, "\r")
                .replace(/\\t/g, "\t")
                .replace(/\\v/g, "")
                .replace(/\\n/g, "\n")
                .replace(/\\r/g, "\r")
                .replace(/\\ /g, "")
                .replace(/\\'/g, "")
                .replace(/\\"/g, "");
              var h = 0,
                i = 0,
                j = "",
                k = [];
              while (!0) {
                if (h >= a.length) {
                  if (f !== b) {
                    var l = g(a.substring(i, h));
                    k.push(new n(this, l, i, h, j, ""));
                  } else if (h !== i) {
                    var m = a.substring(i, h),
                      o = k[k.length - 1];
                    o ? (o.suffix += m) : ((o = new n(this, "", h, h, m, "")), k.push(o));
                  }
                  break;
                }
                var p = a[h];
                switch (f) {
                  case b:
                    p === "'"
                      ? ((j = a.substring(i, h + 1)), (f = d), (i = h + 1))
                      : p === '"'
                      ? ((j = a.substring(i, h + 1)), (f = e), (i = h + 1))
                      : / /.test(p) || ((j = a.substring(i, h)), (f = c), (i = h));
                    break;
                  case c:
                    if (p === " ") {
                      var l = g(a.substring(i, h));
                      k.push(new n(this, l, i, h, j, "")), (f = b), (i = h), (j = "");
                    }
                    break;
                  case d:
                    if (p === "'") {
                      var l = g(a.substring(i, h));
                      k.push(new n(this, l, i - 1, h + 1, j, p)), (f = b), (i = h + 1), (j = "");
                    }
                    break;
                  case e:
                    if (p === '"') {
                      var l = g(a.substring(i, h));
                      k.push(new n(this, l, i - 1, h + 1, j, p)), (f = b), (i = h + 1), (j = "");
                    }
                }
                h++;
              }
              return k;
            }),
            (r.prototype._split = function (a) {
              var b = 1,
                c;
              while (b <= a.length) {
                var c = n.merge(a, 0, b);
                this.commandAssignment.setArgument(c);
                if (!this.commandAssignment.value) break;
                if (this.commandAssignment.value.exec) {
                  for (var d = 0; d < b; d++) a.shift();
                  break;
                }
                b++;
              }
            }),
            (r.prototype._assign = function (a) {
              if (a.length === 0) this.setDefaultValues();
              else {
                if (this.assignmentCount === 0) {
                  this._hints.push(
                    new l(i.INVALID, this.commandAssignment.value.name + " does not take any parameters", n.merge(a))
                  );
                  return;
                }
                if (this.assignmentCount === 1) {
                  var b = this.getAssignment(0);
                  if (b.param.type.name === "text") {
                    b.setArgument(n.merge(a));
                    return;
                  }
                }
                var c = this.cloneAssignments(),
                  d = this.getParameterNames(),
                  f = [];
                c.forEach(function (b) {
                  var c = "--" + b.name,
                    f = 0;
                  while (!0) {
                    var g = a[f];
                    if (c !== g.text) {
                      f++;
                      if (f >= a.length) break;
                      continue;
                    }
                    b.param.type.name === "boolean"
                      ? b.setValue(!0)
                      : f + 1 < a.length
                      ? this._hints.push(new l(i.INCOMPLETE, "Missing value for: " + c, a[f]))
                      : (a.splice(f + 1, 1), b.setArgument(a[f + 1])),
                      e.arrayRemove(d, b.name),
                      a.splice(f, 1);
                  }
                }, this),
                  d.forEach(function (b) {
                    var c = this.getAssignment(b);
                    if (a.length === 0) c.setValue(undefined);
                    else {
                      var d = a[0];
                      a.splice(0, 1), c.setArgument(d);
                    }
                  }, this);
                if (a.length > 0) {
                  var g = n.merge(a);
                  this._hints.push(new l(i.INVALID, "Input '" + g.text + "' makes no sense.", g));
                }
              }
            });
        })(),
        (b.CliRequisition = r);
    }
  ),
  define(
    "cockpit/ui/settings",
    ["require", "exports", "module", "pilot/types", "pilot/types/basic"],
    function (a, b, c) {
      var d = a("pilot/types"),
        e = a("pilot/types/basic").SelectionType,
        f = new e({ name: "direction", data: ["above", "below"] }),
        g = {
          name: "hintDirection",
          description: "Are hints shown above or below the command line?",
          type: "direction",
          defaultValue: "above",
        },
        h = {
          name: "outputDirection",
          description: "Is the output window shown above or below the command line?",
          type: "direction",
          defaultValue: "above",
        },
        i = {
          name: "outputHeight",
          description: "What height should the output panel be?",
          type: "number",
          defaultValue: 300,
        };
      (b.startup = function (a, b) {
        d.registerType(f), a.env.settings.addSetting(g), a.env.settings.addSetting(h), a.env.settings.addSetting(i);
      }),
        (b.shutdown = function (a, b) {
          d.unregisterType(f),
            a.env.settings.removeSetting(g),
            a.env.settings.removeSetting(h),
            a.env.settings.removeSetting(i);
        });
    }
  ),
  define(
    "cockpit/ui/cli_view",
    [
      "require",
      "exports",
      "module",
      "text!cockpit/ui/cli_view.css",
      "pilot/event",
      "pilot/dom",
      "pilot/keys",
      "pilot/canon",
      "pilot/types",
      "cockpit/cli",
      "cockpit/ui/request_view",
    ],
    function (a, b, c) {
      function n(a, b) {
        (a.cliView = this),
          (this.cli = a),
          (this.doc = document),
          (this.win = f.getParentWindow(this.doc)),
          (this.env = b),
          (this.element = this.doc.getElementById("cockpitInput"));
        this.element &&
          ((this.settings = b.settings),
          (this.hintDirection = this.settings.getSetting("hintDirection")),
          (this.outputDirection = this.settings.getSetting("outputDirection")),
          (this.outputHeight = this.settings.getSetting("outputHeight")),
          (this.isUpdating = !1),
          this.createElements(),
          this.update());
      }
      var d = a("text!cockpit/ui/cli_view.css"),
        e = a("pilot/event"),
        f = a("pilot/dom");
      f.importCssString(d);
      var e = a("pilot/event"),
        g = a("pilot/keys"),
        h = a("pilot/canon"),
        i = a("pilot/types").Status,
        j = a("cockpit/cli").CliRequisition,
        k = a("cockpit/cli").Hint,
        l = a("cockpit/ui/request_view").RequestView,
        m = new k(i.VALID, "", 0, 0);
      (b.startup = function (a, b) {
        var c = new j(a.env),
          d = new n(c, a.env);
        a.env.cli = c;
      }),
        (n.prototype = {
          createElements: function () {
            function d() {
              f.removeCssClass(this.output, "cptFocusPopup"), f.removeCssClass(this.hinter, "cptFocusPopup");
            }
            var a = this.element;
            (this.element.spellcheck = !1),
              (this.output = this.doc.getElementById("cockpitOutput")),
              (this.popupOutput = this.output == null);
            if (!this.output) {
              (this.output = this.doc.createElement("div")),
                (this.output.id = "cockpitOutput"),
                (this.output.className = "cptOutput"),
                a.parentNode.insertBefore(this.output, a.nextSibling);
              var b = function () {
                this.output.style.maxHeight = this.outputHeight.get() + "px";
              }.bind(this);
              this.outputHeight.addEventListener("change", b), b();
            }
            (this.completer = this.doc.createElement("div")),
              (this.completer.className = "cptCompletion VALID"),
              (this.completer.style.color = f.computedStyle(a, "color")),
              (this.completer.style.fontSize = f.computedStyle(a, "fontSize")),
              (this.completer.style.fontFamily = f.computedStyle(a, "fontFamily")),
              (this.completer.style.fontWeight = f.computedStyle(a, "fontWeight")),
              (this.completer.style.fontStyle = f.computedStyle(a, "fontStyle")),
              a.parentNode.insertBefore(this.completer, a.nextSibling),
              (this.completer.style.backgroundColor = a.style.backgroundColor),
              (a.style.backgroundColor = "transparent"),
              (this.hinter = this.doc.createElement("div")),
              (this.hinter.className = "cptHints"),
              a.parentNode.insertBefore(this.hinter, a.nextSibling);
            var c = this.resizer.bind(this);
            e.addListener(this.win, "resize", c),
              this.hintDirection.addEventListener("change", c),
              this.outputDirection.addEventListener("change", c),
              c(),
              h.addEventListener(
                "output",
                function (a) {
                  new l(a.request, this);
                }.bind(this)
              ),
              e.addCommandKeyListener(a, this.onCommandKey.bind(this)),
              e.addListener(a, "keyup", this.onKeyUp.bind(this)),
              e.addListener(
                a,
                "mouseup",
                function (a) {
                  (this.isUpdating = !0), this.update(), (this.isUpdating = !1);
                }.bind(this)
              ),
              this.cli.addEventListener("argumentChange", this.onArgChange.bind(this)),
              e.addListener(
                a,
                "focus",
                function () {
                  f.addCssClass(this.output, "cptFocusPopup"), f.addCssClass(this.hinter, "cptFocusPopup");
                }.bind(this)
              ),
              e.addListener(a, "blur", d.bind(this)),
              d.call(this);
          },
          scrollOutputToBottom: function () {
            var a = Math.max(this.output.scrollHeight, this.output.clientHeight);
            this.output.scrollTop = a - this.output.clientHeight;
          },
          resizer: function () {
            var a = this.element.getClientRects()[0];
            this.completer.style.top = a.top + "px";
            var b = a.bottom - a.top;
            (this.completer.style.height = b + "px"),
              (this.completer.style.lineHeight = b + "px"),
              (this.completer.style.left = a.left + "px");
            var c = a.right - a.left;
            (this.completer.style.width = c + "px"),
              this.hintDirection.get() === "below"
                ? ((this.hinter.style.top = a.bottom + "px"), (this.hinter.style.bottom = "auto"))
                : ((this.hinter.style.top = "auto"),
                  (this.hinter.style.bottom = this.doc.documentElement.clientHeight - a.top + "px")),
              (this.hinter.style.left = a.left + 30 + "px"),
              (this.hinter.style.maxWidth = c - 110 + "px"),
              this.popupOutput &&
                (this.outputDirection.get() === "below"
                  ? ((this.output.style.top = a.bottom + "px"), (this.output.style.bottom = "auto"))
                  : ((this.output.style.top = "auto"),
                    (this.output.style.bottom = this.doc.documentElement.clientHeight - a.top + "px")),
                (this.output.style.left = a.left + "px"),
                (this.output.style.width = c - 80 + "px"));
          },
          onCommandKey: function (a, b, c) {
            var d;
            if (c === g.TAB || c === g.UP || c === g.DOWN) d = !0;
            else if (b != 0 || c != 0) d = h.execKeyCommand(this.env, "cli", b, c);
            d && e.stopEvent(a);
          },
          onKeyUp: function (a) {
            var b;
            if (a.keyCode === g.RETURN) {
              var c = this.cli.getWorstHint();
              c.status === i.VALID
                ? (this.cli.exec(), (this.element.value = ""))
                : (f.setSelectionStart(this.element, c.start), f.setSelectionEnd(this.element, c.end));
            }
            this.update();
            var d = this.cli.getAssignmentAt(f.getSelectionStart(this.element));
            d &&
              (a.keyCode === g.TAB && (d.complete(), this.update()),
              a.keyCode === g.UP && (d.increment(), this.update()),
              a.keyCode === g.DOWN && (d.decrement(), this.update()));
            return b;
          },
          update: function () {
            this.isUpdating = !0;
            var a = {
              typed: this.element.value,
              cursor: { start: f.getSelectionStart(this.element), end: f.getSelectionEnd(this.element.selectionEnd) },
            };
            this.cli.update(a);
            var b = this.cli.getAssignmentAt(a.cursor.start).getHint();
            f.removeCssClass(this.completer, i.VALID.toString()),
              f.removeCssClass(this.completer, i.INCOMPLETE.toString()),
              f.removeCssClass(this.completer, i.INVALID.toString());
            var c = '<span class="cptPrompt">&gt;</span> ';
            if (this.element.value.length > 0) {
              var d = this.cli.getInputStatusMarkup();
              c += this.markupStatusScore(d);
            }
            if (this.element.value.length > 0 && b.predictions && b.predictions.length > 0) {
              var e = b.predictions[0];
              c += " &nbsp;&#x21E5; " + (e.name ? e.name : e);
            }
            (this.completer.innerHTML = c), f.addCssClass(this.completer, this.cli.getWorstHint().status.toString());
            var g = "";
            this.element.value.length !== 0 &&
              ((g += b.message),
              b.predictions &&
                b.predictions.length > 0 &&
                ((g += ": [ "),
                b.predictions.forEach(function (a) {
                  (g += a.name ? a.name : a), (g += " | ");
                }, this),
                (g = g.replace(/\| $/, "]")))),
              (this.hinter.innerHTML = g),
              g.length === 0 ? f.addCssClass(this.hinter, "cptNoPopup") : f.removeCssClass(this.hinter, "cptNoPopup"),
              (this.isUpdating = !1);
          },
          markupStatusScore: function (a) {
            var b = "",
              c = 0,
              d = -1;
            while (!0) {
              d !== a[c] && ((b += "<span class=" + a[c].toString() + ">"), (d = a[c])),
                (b += this.element.value[c]),
                c++;
              if (c === this.element.value.length) {
                b += "</span>";
                break;
              }
              d !== a[c] && (b += "</span>");
            }
            return b;
          },
          onArgChange: function (a) {
            if (!this.isUpdating) {
              var b = this.element.value.substring(0, a.argument.start),
                c = this.element.value.substring(a.argument.end),
                d = typeof a.text === "string" ? a.text : a.text.name;
              this.element.value = b + d + c;
              var e = (b + d).length;
              (this.element.selectionStart = e), (this.element.selectionEnd = e);
            }
          },
        }),
        (b.CliView = n);
    }
  ),
  define(
    "cockpit/ui/request_view",
    [
      "require",
      "exports",
      "module",
      "pilot/dom",
      "pilot/event",
      "text!cockpit/ui/request_view.html",
      "pilot/domtemplate",
      "text!cockpit/ui/request_view.css",
    ],
    function (a, b, c) {
      function l(a, b) {
        (this.request = a),
          (this.cliView = b),
          (this.imageUrl = k),
          (this.rowin = null),
          (this.rowout = null),
          (this.output = null),
          (this.hide = null),
          (this.show = null),
          (this.duration = null),
          (this.throb = null),
          new g().processNode(j.cloneNode(!0), this),
          this.cliView.output.appendChild(this.rowin),
          this.cliView.output.appendChild(this.rowout),
          this.request.addEventListener("output", this.onRequestChange.bind(this));
      }
      function k(b) {
        var d;
        try {
          d = a("text!cockpit/ui/" + b);
        } catch (e) {}
        if (d) return d;
        var f = c.id.split("/").pop() + ".js",
          g;
        if (c.uri.substr(-f.length) !== f) {
          console.error("Can't work out path from module.uri/module.id");
          return b;
        }
        if (c.uri) {
          var h = c.uri.length - f.length - 1;
          return c.uri.substr(0, h) + "/" + b;
        }
        return f + b;
      }
      var d = a("pilot/dom"),
        e = a("pilot/event"),
        f = a("text!cockpit/ui/request_view.html"),
        g = a("pilot/domtemplate").Templater,
        h = a("text!cockpit/ui/request_view.css");
      d.importCssString(h);
      var i = document.createElement("div");
      i.innerHTML = f;
      var j = i.querySelector(".cptRow");
      (l.prototype = {
        copyToInput: function () {
          this.cliView.element.value = this.request.typed;
        },
        executeRequest: function (a) {
          this.cliView.cli.update({ typed: this.request.typed, cursor: { start: 0, end: 0 } }), this.cliView.cli.exec();
        },
        hideOutput: function (a) {
          (this.output.style.display = "none"),
            d.addCssClass(this.hide, "cmd_hidden"),
            d.removeCssClass(this.show, "cmd_hidden"),
            e.stopPropagation(a);
        },
        showOutput: function (a) {
          (this.output.style.display = "block"),
            d.removeCssClass(this.hide, "cmd_hidden"),
            d.addCssClass(this.show, "cmd_hidden"),
            e.stopPropagation(a);
        },
        remove: function (a) {
          this.cliView.output.removeChild(this.rowin),
            this.cliView.output.removeChild(this.rowout),
            e.stopPropagation(a);
        },
        onRequestChange: function (a) {
          (this.duration.innerHTML = this.request.duration
            ? "completed in " + this.request.duration / 1e3 + " sec "
            : ""),
            (this.output.innerHTML = ""),
            this.request.outputs.forEach(function (a) {
              var b;
              typeof a == "string" ? ((b = document.createElement("p")), (b.innerHTML = a)) : (b = a),
                this.output.appendChild(b);
            }, this),
            this.cliView.scrollOutputToBottom(),
            d.setCssClass(this.output, "cmd_error", this.request.error),
            (this.throb.style.display = this.request.completed ? "none" : "block");
        },
      }),
        (b.RequestView = l);
    }
  ),
  define("pilot/domtemplate", ["require", "exports", "module"], function (require, exports, module) {
    function Templater() {
      this.scope = [];
    }
    (Templater.prototype.processNode = function (a, b) {
      typeof a === "string" && (a = document.getElementById(a));
      if (b === null || b === undefined) b = {};
      this.scope.push(a.nodeName + (a.id ? "#" + a.id : ""));
      try {
        if (a.attributes && a.attributes.length) {
          if (a.hasAttribute("foreach")) {
            this.processForEach(a, b);
            return;
          }
          if (a.hasAttribute("if")) if (!this.processIf(a, b)) return;
          b.__element = a;
          var c = Array.prototype.slice.call(a.attributes);
          for (var d = 0; d < c.length; d++) {
            var e = c[d].value,
              f = c[d].name;
            this.scope.push(f);
            try {
              if (f === "save") (e = this.stripBraces(e)), this.property(e, b, a), a.removeAttribute("save");
              else if (f.substring(0, 2) === "on") {
                e = this.stripBraces(e);
                var g = this.property(e, b);
                typeof g !== "function" &&
                  this.handleError("Expected " + e + " to resolve to a function, but got " + typeof g),
                  a.removeAttribute(f);
                var h = a.hasAttribute("capture" + f.substring(2));
                a.addEventListener(f.substring(2), g, h), h && a.removeAttribute("capture" + f.substring(2));
              } else {
                var i = this,
                  j = e.replace(/\$\{[^}]*\}/g, function (a) {
                    return i.envEval(a.slice(2, -1), b, e);
                  });
                f.charAt(0) === "_"
                  ? (a.removeAttribute(f), a.setAttribute(f.substring(1), j))
                  : e !== j && (c[d].value = j);
              }
            } finally {
              this.scope.pop();
            }
          }
        }
        var k = Array.prototype.slice.call(a.childNodes);
        for (var l = 0; l < k.length; l++) this.processNode(k[l], b);
        a.nodeType === Node.TEXT_NODE && this.processTextNode(a, b);
      } finally {
        this.scope.pop();
      }
    }),
      (Templater.prototype.processIf = function (a, b) {
        this.scope.push("if");
        try {
          var c = a.getAttribute("if"),
            d = this.stripBraces(c),
            e = !0;
          try {
            var f = this.envEval(d, b, c);
            e = !!f;
          } catch (g) {
            this.handleError("Error with '" + d + "'", g), (e = !1);
          }
          e || a.parentNode.removeChild(a), a.removeAttribute("if");
          return e;
        } finally {
          this.scope.pop();
        }
      }),
      (Templater.prototype.processForEach = function (a, b) {
        this.scope.push("foreach");
        try {
          var c = a.getAttribute("foreach"),
            d = c,
            e = "param";
          if (d.charAt(0) === "$") d = this.stripBraces(d);
          else {
            var f = d.split(" in ");
            (e = f[0].trim()), (d = this.stripBraces(f[1].trim()));
          }
          a.removeAttribute("foreach");
          try {
            var g = this,
              h = function (a, c, d) {
                d.parentNode.insertBefore(c, d), (b[e] = a), g.processNode(c, b), delete b[e];
              },
              i = function (b, c) {
                g.scope.push(b);
                try {
                  if (a.nodeName === "LOOP")
                    for (var d = 0; d < a.childNodes.length; d++) {
                      var e = a.childNodes[d].cloneNode(!0);
                      h(c, e, a);
                    }
                  else {
                    var e = a.cloneNode(!0);
                    e.removeAttribute("foreach"), h(c, e, a);
                  }
                } finally {
                  g.scope.pop();
                }
              },
              j = this.envEval(d, b, c);
            if (Array.isArray(j))
              j.forEach(function (a, b) {
                i("" + b, a);
              }, this);
            else for (var k in j) j.hasOwnProperty(k) && i(k, k);
            a.parentNode.removeChild(a);
          } catch (l) {
            this.handleError("Error with '" + d + "'", l);
          }
        } finally {
          this.scope.pop();
        }
      }),
      (Templater.prototype.processTextNode = function (a, b) {
        var c = a.data;
        c = c.replace(/\$\{([^}]*)\}/g, "$$$1");
        var d = c.split(/\uF001|\uF002/);
        d.length > 1 &&
          (d.forEach(function (c) {
            c !== null &&
              c !== undefined &&
              c !== "" &&
              (c.charAt(0) === "$" && (c = this.envEval(c.slice(1), b, a.data)),
              c === null && (c = "null"),
              c === undefined && (c = "undefined"),
              typeof c.cloneNode !== "function" && (c = a.ownerDocument.createTextNode(c.toString())),
              a.parentNode.insertBefore(c, a));
          }, this),
          a.parentNode.removeChild(a));
      }),
      (Templater.prototype.stripBraces = function (a) {
        if (!a.match(/\$\{.*\}/g)) {
          this.handleError("Expected " + a + " to match ${...}");
          return a;
        }
        return a.slice(2, -1);
      }),
      (Templater.prototype.property = function (a, b, c) {
        this.scope.push(a);
        try {
          typeof a === "string" && (a = a.split("."));
          var d = b[a[0]];
          if (a.length === 1) {
            c !== undefined && (b[a[0]] = c);
            if (typeof d === "function")
              return function () {
                return d.apply(b, arguments);
              };
            return d;
          }
          if (!d) {
            this.handleError("Can't find path=" + a);
            return null;
          }
          return this.property(a.slice(1), d, c);
        } finally {
          this.scope.pop();
        }
      }),
      (Templater.prototype.envEval = function (script, env, context) {
        with (env)
          try {
            this.scope.push(context);
            return eval(script);
          } catch (ex) {
            this.handleError("Template error evaluating '" + script + "'", ex);
            return script;
          } finally {
            this.scope.pop();
          }
      }),
      (Templater.prototype.handleError = function (a, b) {
        this.logError(a), this.logError("In: " + this.scope.join(" > ")), b && this.logError(b);
      }),
      (Templater.prototype.logError = function (a) {
        window.console && window.console.log && console.log(a);
      }),
      (exports.Templater = Templater);
  }),
  define("cockpit/commands/basic", ["require", "exports", "module", "pilot/canon"], function (a, b, c) {
    var d = a("pilot/canon"),
      e = {
        name: "sh",
        description: "Execute a system command (requires server support)",
        params: [{ name: "command", type: "text", description: "The string to send to the os shell." }],
        exec: function (a, b, c) {
          var d = new XMLHttpRequest();
          d.open("GET", "/exec?args=" + b.command, !0),
            (d.onreadystatechange = function (a) {
              d.readyState == 4 && d.status == 200 && c.done("<pre>" + d.responseText + "</pre>");
            }),
            d.send(null);
        },
      },
      d = a("pilot/canon");
    (b.startup = function (a, b) {
      d.addCommand(e);
    }),
      (b.shutdown = function (a, b) {
        d.removeCommand(e);
      });
  }),
  define(
    "text!cockpit/ui/cli_view.css",
    [],
    "#cockpitInput { padding-left: 16px; }.cptOutput { overflow: auto; position: absolute; z-index: 999; display: none; }.cptCompletion { padding: 0; position: absolute; z-index: -1000; }.cptCompletion.VALID { background: #FFF; }.cptCompletion.INCOMPLETE { background: #DDD; }.cptCompletion.INVALID { background: #DDD; }.cptCompletion span { color: #FFF; }.cptCompletion span.INCOMPLETE { color: #DDD; border-bottom: 2px dotted #F80; }.cptCompletion span.INVALID { color: #DDD; border-bottom: 2px dotted #F00; }span.cptPrompt { color: #66F; font-weight: bold; }.cptHints {  color: #000;  position: absolute;  border: 1px solid rgba(230, 230, 230, 0.8);  background: rgba(250, 250, 250, 0.8);  -moz-border-radius-topleft: 10px;  -moz-border-radius-topright: 10px;  border-top-left-radius: 10px; border-top-right-radius: 10px;  z-index: 1000;  padding: 8px;  display: none;}.cptFocusPopup { display: block; }.cptFocusPopup.cptNoPopup { display: none; }.cptHints ul { margin: 0; padding: 0 15px; }.cptGt { font-weight: bold; font-size: 120%; }"
  ),
  define(
    "text!cockpit/ui/request_view.css",
    [],
    ".cptRowIn {  display: box; display: -moz-box; display: -webkit-box;  box-orient: horizontal; -moz-box-orient: horizontal; -webkit-box-orient: horizontal;  box-align: center; -moz-box-align: center; -webkit-box-align: center;  color: #333;  background-color: #EEE;  width: 100%;  font-family: consolas, courier, monospace;}.cptRowIn > * { padding-left: 2px; padding-right: 2px; }.cptRowIn > img { cursor: pointer; }.cptHover { display: none; }.cptRowIn:hover > .cptHover { display: block; }.cptRowIn:hover > .cptHover.cptHidden { display: none; }.cptOutTyped {  box-flex: 1; -moz-box-flex: 1; -webkit-box-flex: 1;  font-weight: bold; color: #000; font-size: 120%;}.cptRowOutput { padding-left: 10px; line-height: 1.2em; }.cptRowOutput strong,.cptRowOutput b,.cptRowOutput th,.cptRowOutput h1,.cptRowOutput h2,.cptRowOutput h3 { color: #000; }.cptRowOutput a { font-weight: bold; color: #666; text-decoration: none; }.cptRowOutput a: hover { text-decoration: underline; cursor: pointer; }.cptRowOutput input[type=password],.cptRowOutput input[type=text],.cptRowOutput textarea {  color: #000; font-size: 120%;  background: transparent; padding: 3px;  border-radius: 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px;}.cptRowOutput table,.cptRowOutput td,.cptRowOutput th { border: 0; padding: 0 2px; }.cptRowOutput .right { text-align: right; }"
  ),
  define(
    "text!cockpit/ui/request_view.html",
    [],
    '<div class=cptRow>  <!-- The div for the input (i.e. what was typed) -->  <div class="cptRowIn" save="${rowin}"      onclick="${copyToInput}"      ondblclick="${executeRequest}">    <!-- What the user actually typed -->    <div class="cptGt">&gt; </div>    <div class="cptOutTyped">${request.typed}</div>    <!-- The extra details that appear on hover -->    <div class=cptHover save="${duration}"></div>    <img class=cptHover onclick="${hideOutput}" save="${hide}"        alt="Hide command output" _src="${imageUrl(\'images/minus.png\')}"/>    <img class="cptHover cptHidden" onclick="${showOutput}" save="${show}"        alt="Show command output" _src="${imageUrl(\'images/plus.png\')}"/>    <img class=cptHover onclick="${remove}"        alt="Remove this command from the history"        _src="${imageUrl(\'images/closer.png\')}"/>  </div>  <!-- The div for the command output -->  <div class="cptRowOut" save="${rowout}">    <div class="cptRowOutput" save="${output}"></div>    <img _src="${imageUrl(\'images/throbber.gif\')}" save="${throb}"/>  </div></div>'
  ),
  define(
    "text!cockpit/ui/images/closer.png",
    [],
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAj9JREFUeNp0ks+LUlEUx7/vV1o8Z8wUx3IEHcQmiBiQlomjRNCiZpEuEqF/oEUwq/6EhvoHggmRcJUQBM1CRJAW0aLIaGQimZJxJsWxyV/P9/R1zzWlFl04vPvOPZ9z7rnnK5imidmKRCIq+zxgdoPZ1T/ut8xeM3tcKpW6s1hhBkaj0Qj7bDebTX+324WmadxvsVigqipcLleN/d4rFoulORiLxTZY8ItOp8MBCpYkiYPj8Xjus9vtlORWoVB4KcTjcQc732dLpSRXvCZaAws6Q4WDdqsO52kNH+oCRFGEz+f7ydwBKRgMPmTXi49GI1x2D/DsznesB06ws2eDbI7w9HYN6bVjvGss4KAjwDAMq81mM2SW5Wa/3weBbz42UL9uYnVpiO2Nr9ANHSGXib2Wgm9tCYIggGKJEVkvlwgi5/FQRmTLxO6hgJVzI1x0T/fJrBtHJxPeL6tI/fsZLA6ot8lkQi8HRVbw94gkWYI5MaHrOjcCGSNRxZosy9y5cErDzn0Dqx7gcwO8WtBp4PndI35GMYqiUMUvBL5yOBz8yRfFNpbPmqgcCFh/IuHa1nR/YXGM8+oUpFhihEQiwcdRLpfVRqOBtWXWq34Gra6AXq8Hp2piZcmKT4cKnE4nwuHwdByVSmWQz+d32WCTlHG/qaHHREN9kgi0sYQfv0R4PB4EAgESQDKXy72fSy6VSnHJVatVf71eR7vd5n66mtfrRSgU4pLLZrOlf7RKK51Ok8g3/yPyR5lMZi7y3wIMAME4EigHWgKnAAAAAElFTkSuQmCC"
  ),
  define(
    "text!cockpit/ui/images/dot_clear.gif",
    [],
    "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAEBMgA7"
  ),
  define(
    "text!cockpit/ui/images/minus.png",
    [],
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAAZiS0dEANIA0gDS7KbF4AAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kFGw4xMrIJw5EAAAHcSURBVCjPhZIxSxtxGMZ/976XhJA/RA5EAyJcFksnp64hjUPBoXRyCYLQTyD0UxScu0nFwalCQSgFCVk7dXAwUAiBDA2RO4W7yN1x9+9gcyhU+pteHt4H3pfncay1LOl0OgY4BN4Ar/7KP4BvwNFwOIyWu87S2O12O8DxfD73oygiSRIAarUaxhhWV1fHwMFgMBiWxl6v9y6Koi+3t7ckSUKtVkNVAcjzvNRWVlYwxry9vLz86uzs7HjAZDKZGGstjUaDfxHHMSLC5ubmHdB2VfVwNpuZ5clxHPMcRVFwc3PTXFtbO3RFZHexWJCmabnweAaoVqvlv4vFAhHZdVX1ZZqmOI5DURR8fz/lxbp9Yrz+7bD72SfPcwBU1XdF5N5aWy2KgqIoeBzPEnWVLMseYnAcRERdVR27rrsdxzGqyutP6898+GBsNBqo6i9XVS88z9sOggAR4X94noeqXoiIHPm+H9XrdYIgIAxDwjAkTVPCMESzBy3LMprNJr7v34nIkV5dXd2fn59fG2P2siwjSRIqlQrWWlSVJFcqlQqtVot2u40xZu/s7OxnWbl+v98BjkejkT+dTgmCoDxtY2ODra2tMXBweno6fNJVgP39fQN8eKbkH09OTsqS/wHFRdHPfTSfjwAAAABJRU5ErkJggg=="
  ),
  define(
    "text!cockpit/ui/images/pinaction.png",
    [],
    "data:image/png;base64,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"
  ),
  define(
    "text!cockpit/ui/images/pinin.png",
    [],
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC7mlDQ1BJQ0MgUHJvZmlsZQAAeAGFVM9rE0EU/jZuqdAiCFprDrJ4kCJJWatoRdQ2/RFiawzbH7ZFkGQzSdZuNuvuJrWliOTi0SreRe2hB/+AHnrwZC9KhVpFKN6rKGKhFy3xzW5MtqXqwM5+8943731vdt8ADXLSNPWABOQNx1KiEWlsfEJq/IgAjqIJQTQlVdvsTiQGQYNz+Xvn2HoPgVtWw3v7d7J3rZrStpoHhP1A4Eea2Sqw7xdxClkSAog836Epx3QI3+PY8uyPOU55eMG1Dys9xFkifEA1Lc5/TbhTzSXTQINIOJT1cVI+nNeLlNcdB2luZsbIEL1PkKa7zO6rYqGcTvYOkL2d9H5Os94+wiHCCxmtP0a4jZ71jNU/4mHhpObEhj0cGDX0+GAVtxqp+DXCFF8QTSeiVHHZLg3xmK79VvJKgnCQOMpkYYBzWkhP10xu+LqHBX0m1xOv4ndWUeF5jxNn3tTd70XaAq8wDh0MGgyaDUhQEEUEYZiwUECGPBoxNLJyPyOrBhuTezJ1JGq7dGJEsUF7Ntw9t1Gk3Tz+KCJxlEO1CJL8Qf4qr8lP5Xn5y1yw2Fb3lK2bmrry4DvF5Zm5Gh7X08jjc01efJXUdpNXR5aseXq8muwaP+xXlzHmgjWPxHOw+/EtX5XMlymMFMXjVfPqS4R1WjE3359sfzs94i7PLrXWc62JizdWm5dn/WpI++6qvJPmVflPXvXx/GfNxGPiKTEmdornIYmXxS7xkthLqwviYG3HCJ2VhinSbZH6JNVgYJq89S9dP1t4vUZ/DPVRlBnM0lSJ93/CKmQ0nbkOb/qP28f8F+T3iuefKAIvbODImbptU3HvEKFlpW5zrgIXv9F98LZua6N+OPwEWDyrFq1SNZ8gvAEcdod6HugpmNOWls05Uocsn5O66cpiUsxQ20NSUtcl12VLFrOZVWLpdtiZ0x1uHKE5QvfEp0plk/qv8RGw/bBS+fmsUtl+ThrWgZf6b8C8/UXAeIuJAAAACXBIWXMAAAsTAAALEwEAmpwYAAABZ0lEQVQ4Ea2TPUsDQRCGZ89Eo4FACkULEQs1CH4Uamfjn7GxEYJFIFXgChFsbPwzNnZioREkaiHBQtEiEEiMRm/dZ8OEGAxR4sBxx877Pju7M2estTJIxLrNuVwuMxQEx0ZkzcFHyRtjXt02559RtB2GYanTYzoryOfz+6l4Nbszf2niwffKmpGRo9sVW22mDgqFwp5C2gDMm+P32a3JB1N+n5JifUGeP9JeNxGryPLYjcwMP8rJ07Q9fZltQzyAstOJ2vVu5sKc1ZZkRBrOcKeb+HexPidvkpCN5JUcllZtpZFc5DgBWc5M2eysZuMuofMBSA4NWjx4PUCsXefMlI0QY3ewRg4NWi4ZTQsgrjYXema+e4VqtEMK6KXvu+4B9Bklt90vVKMeD2BI6DOt4rZ/Gk7WyKFBi4fNPIAJY0joM61SCCZ9tI1o0OIB8D+DBIkYaJRbCBH9mZgNt+bb++ufSSF/eX8BYcDeAzuQJVUAAAAASUVORK5CYII="
  ),
  define(
    "text!cockpit/ui/images/pinout.png",
    [],
    "data:image/png;base64,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"
  ),
  define(
    "text!cockpit/ui/images/pins.png",
    [],
    "data:image/png;base64,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"
  ),
  define(
    "text!cockpit/ui/images/plus.png",
    [],
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAAZiS0dEANIA0gDS7KbF4AAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kFGw4yFTwuJTkAAAH7SURBVCjPdZKxa1NRFMZ/956XZMgFyyMlCZRA4hBx6lBcQ00GoYi4tEstFPwLAs7iLDi7FWuHThaUggihBDI5OWRoQAmBQFISQgvvpbwX3rsOaR4K+o2H8zvfOZxPWWtZqVarGaAJPAEe3ZW/A1+Bd+1221v1qhW4vb1dA44mk0nZ8zyCIAAgk8lgjGF9fb0PHF5cXLQTsF6vP/c879P19TVBEJDJZBARAKIoSmpra2sYY561Wq3PqtFouMBgMBgYay3ZbJZ/yfd9tNaUSqUboOKISPPq6sqsVvZ9H4AvL34B8PTj/QSO45jpdHovn883Ha31znw+JwzDpCEMQx4UloM8zyOdTif3zudztNY7jog8DMMQpRRxHPPt5TCBAEZvxlyOFTsfykRRBICIlB2t9a21Nh3HMXEc8+d7VhJHWCwWyzcohdZaHBHpO46z6fs+IsLj94XECaD4unCHL8FsNouI/HRE5Nx13c3ZbIbWOnG5HKtl+53TSq7rIiLnand31wUGnU7HjEYjlFLJZN/3yRnL1FMYY8jlcmxtbd0AFel2u7dnZ2eXxpi9xWJBEASkUimstYgIQSSkUimKxSKVSgVjzN7p6emPJHL7+/s14KjX65WHwyGz2SxZbWNjg2q12gcOT05O2n9lFeDg4MAAr/4T8rfHx8dJyH8DvvbYGzKvWukAAAAASUVORK5CYII="
  ),
  define(
    "text!cockpit/ui/images/throbber.gif",
    [],
    "data:image/gif;base64,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"
  );
