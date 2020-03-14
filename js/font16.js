var Font16 = {
    kerning: [10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 8, 10, 8, 10, 7, 10, 8, 10, 8, 10, 13, 10, 12, 10, 4, 10, 5, 10, 5, 10, 6, 10, 8, 10, 5, 10, 5, 10, 5, 10, 9, 10, 12, 10, 5, 10, 9, 10, 8, 10, 9, 10, 9, 10, 8, 10, 8, 10, 7, 10, 8, 10, 5, 10, 5, 10, 6, 10, 7, 10, 6, 10, 8, 10, 11, 10, 12, 10, 7, 10, 9, 10, 10, 10, 8, 10, 8, 10, 10, 10, 9, 10, 5, 10, 5, 10, 9, 10, 8, 10, 12, 10, 10, 10, 11, 10, 9, 10, 12, 10, 10, 10, 7, 10, 11, 10, 12, 10, 13, 10, 16, 10, 12, 10, 12, 10, 10, 10, 5, 10, 9, 10, 5, 10, 5, 10, 9, 10, 5, 10, 10, 10, 7, 10, 8, 10, 8, 10, 7, 10, 7, 10, 9, 10, 7, 10, 4, 10, 4, 10, 8, 10, 7, 10, 10, 10, 9, 10, 10, 10, 7, 10, 10, 10, 9, 10, 7, 10, 9, 10, 10, 10, 10, 10, 13, 10, 10, 10, 10, 10, 7, 10, 6, 10, 3, 10, 6, 10, 6, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 5, 10, 6, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 8, 10, 8, 10, 7, 10, 8, 10, 7, 10, 12, 10, 3, 10, 6, 10, 6, 10, 11, 10, 9, 10, 7, 10, 10, 10, 4, 10, 11, 10, 9, 10, 7, 10, 9, 10, 7, 10, 7, 10, 5, 10, 13, 10, 9, 10, 7, 10, 7, 10, 3, 10, 8, 10, 8, 10, 11, 10, 13, 10, 12, 10, 8, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 11, 10, 10, 10, 8, 10, 7, 10, 8, 10, 8, 10, 5, 10, 5, 10, 5, 10, 7, 10, 11, 10, 11, 10, 11, 10, 11, 10, 11, 10, 12, 10, 11, 10, 10, 10, 11, 10, 13, 10, 13, 10, 13, 10, 12, 10, 12, 10, 8, 10, 9, 10, 11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 10, 7, 10, 6, 10, 7, 10, 7, 10, 4, 10, 5, 10, 4, 10, 5, 10, 8, 10, 9, 10, 10, 10, 9, 10, 9, 10, 10, 10, 10, 10, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 7, 10, 10],

    font: [],
    
    measureText: function(text) {
        var lines = Array.isArray(text) ? text : text.split("\n");
        var width = 0;
        var height = 0;

        lines.forEach((line) => {
            var tmpw = 0;
            var tmph = 0;
            
            for (var i = 0; i < line.length; i++) {
                let ch = line.charCodeAt(i);
                if (ch < 256) {
                    tmpw += this.kerning[ch * 2 + 1];
                    tmph += this.kerning[ch * 2];
                }
            }
            
            width = (tmpw > width ? tmpw : width);
            height = (tmph > height ? tmph : height);
        });
        
        return { width: width, height: height };
    },
    
    loadFont: function(color) {
        if (!this.font[color]) {       
            this.font[color] = [];
            for (var ch = 0; ch < 256; ch++) {
                this.font[color][ch] = new Promise((resolve, reject) => {
                    let img = new Image();
                    img.src = "assets/font16/" + ch + "/" + (color>0?color+1:0) + ".png";
                    img.onload = () => {
                        //this.font[color][i] = img;
                        resolve(img);
                    }
                    
                    img.onerror = () => {
                        error("Failed loading Image:", img);
                    }
                });
            }
        } 
        
        return Promise.all(this.font[color]);
    },
    
    drawText(graphics, x, y, text, color) {
        this.loadFont(color).then((font) => {
            this.font[color] = font;
            var x_pos = Math.round(x);
            var y_pos = Math.round(y);
            var lines = Array.isArray(text) ? text : text.split("\n");
            
            lines.forEach((line) => {
                for (var i = 0; i < line.length; i++) {
                    let ch = line.charCodeAt(i);
                    if (ch < 256) {
                        graphics.drawImage(this.font[color][ch], x_pos, y_pos);
                        x_pos += this.kerning[ch * 2 + 1];
                    }
                }
                x_pos = x;
                y_pos += 16;
            });
        }).catch((error) => {
            console.error(error);
        });
    }
}