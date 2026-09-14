/**
 * Minimal flip-tile widget that reuses FlipDown's rotor markup/CSS
 * (see /ext/flipdown/flipdown.min.css) so it looks like part of the
 * same clock, but is driven by an arbitrary string instead of a
 * countdown. Used for things FlipDown itself can't do: an up-counter,
 * or a value fetched from elsewhere (like the gas price ticker).
 */
(function () {
    "use strict";

    function createRotor(initialChar) {
        var rotor = document.createElement("div");
        rotor.className = "rotor";

        var leaf = document.createElement("div");
        leaf.className = "rotor-leaf";

        var rear = document.createElement("figure");
        rear.className = "rotor-leaf-rear";
        rear.textContent = initialChar;

        var front = document.createElement("figure");
        front.className = "rotor-leaf-front";
        front.textContent = initialChar;

        var top = document.createElement("div");
        top.className = "rotor-top";
        top.textContent = initialChar;

        var bottom = document.createElement("div");
        bottom.className = "rotor-bottom";
        bottom.textContent = initialChar;

        leaf.appendChild(rear);
        leaf.appendChild(front);
        rotor.appendChild(leaf);
        rotor.appendChild(top);
        rotor.appendChild(bottom);

        return {
            el: rotor,
            leaf: leaf,
            rear: rear,
            front: front,
            top: top,
            bottom: bottom,
            current: initialChar,
        };
    }

    function FlipTicker(elementId, heading) {
        this.element = document.getElementById(elementId);
        this.element.classList.add("flipdown", "flipdown__theme-dark");
        this.heading = heading || "";
        this.rotors = [];
        this.initialised = false;
    }

    FlipTicker.prototype._build = function (chars) {
        this.element.innerHTML = "";
        this.rotors = [];

        var group = document.createElement("div");
        group.className = "rotor-group";

        var headingEl = document.createElement("div");
        headingEl.className = "rotor-group-heading";
        headingEl.setAttribute("data-before", this.heading);
        group.appendChild(headingEl);

        var self = this;
        chars.forEach(function (ch) {
            var rotor = createRotor(ch);
            self.rotors.push(rotor);
            group.appendChild(rotor.el);
        });

        this.element.appendChild(group);
        this.initialised = true;
    };

    // Flips each changed character into place using the same two-step
    // (leaf flip + top/bottom swap) timing FlipDown uses internally.
    FlipTicker.prototype.setValue = function (text) {
        var chars = text.split("");

        if (!this.initialised || chars.length !== this.rotors.length) {
            this._build(chars);
            return;
        }

        this.rotors.forEach(function (rotor, i) {
            var ch = chars[i];
            if (rotor.current === ch) return;

            rotor.front.textContent = rotor.current;
            rotor.bottom.textContent = rotor.current;

            setTimeout(function () {
                rotor.top.textContent = ch;
            }, 500);

            setTimeout(function () {
                rotor.rear.textContent = ch;
                rotor.leaf.classList.add("flipped");
                setTimeout(function () {
                    rotor.leaf.classList.remove("flipped");
                }, 500);
            }, 500);

            rotor.current = ch;
        });
    };

    window.FlipTicker = FlipTicker;
})();
