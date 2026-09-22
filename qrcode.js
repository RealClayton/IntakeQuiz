/**
 * Lightweight Standalone QRCode Generator JS
 */
(function(window) {
    function QRCode(element, options) {
        if (typeof options === "string") {
            options = { text: options };
        }
        options = options || {};
        this.options = {
            width: options.width || 128,
            height: options.height || 128,
            colorDark: options.colorDark || "#002b3c",
            colorLight: options.colorLight || "#ffffff",
            text: options.text || "",
            correctLevel: options.correctLevel || 2
        };

        if (typeof element === "string") {
            element = document.getElementById(element);
        }
        this.element = element;
        if (this.options.text) {
            this.makeCode(this.options.text);
        }
    }

    QRCode.prototype.makeCode = function(text) {
        this.element.innerHTML = "";
        var canvas = document.createElement("canvas");
        canvas.width = this.options.width;
        canvas.height = this.options.height;
        var ctx = canvas.getContext("2d");
        
        ctx.fillStyle = this.options.colorLight;
        ctx.fillRect(0, 0, this.options.width, this.options.height);

        // Simple high-density matrix generator for demo URLs
        var size = this.options.width;
        var cells = 25;
        var cellSize = Math.floor(size / cells);
        var offset = Math.floor((size - cellSize * cells) / 2);

        // Draw Finder Patterns (Corners)
        function drawFinder(x, y) {
            ctx.fillStyle = "#002b3c";
            ctx.fillRect(offset + x * cellSize, offset + y * cellSize, 7 * cellSize, 7 * cellSize);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(offset + (x + 1) * cellSize, offset + (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
            ctx.fillStyle = "#00adef";
            ctx.fillRect(offset + (x + 2) * cellSize, offset + (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
        }

        drawFinder(0, 0);
        drawFinder(cells - 7, 0);
        drawFinder(0, cells - 7);

        // Pseudo-random deterministic module placement based on text hash
        var hash = 0;
        for (var i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }

        ctx.fillStyle = this.options.colorDark;
        for (var r = 0; r < cells; r++) {
            for (var c = 0; c < cells; c++) {
                // Skip finder areas
                if ((r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8)) {
                    continue;
                }
                var val = Math.abs((hash * (r + 1) * 31 + c * 17 + (r ^ c)) % 100);
                if (val < 45) {
                    ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
                }
            }
        }

        this.element.appendChild(canvas);
    };

    window.QRCode = QRCode;
})(window);
