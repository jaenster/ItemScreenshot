/*!
 * itemScreenshot Library v1.0
 * https://github.com/Fa-b/ItemScreenshot
 * 
 * A pure js solution to generate Diablo II item tooltips from json objects
 * Obj format is the standard kolbot mulelogged item
 * 
 * Authors: Fa-b, laztheripper
 * Date: 2020/03/11
 */

var ItemScreenshot = {
    // Settings
    
	fastMode			: false,	// Draw text using webfont (less pwetty but faster ofc)
    hideItemLevel       : false,	// Hide the item level
    hideRequirements    : false,	// Hide the red text when you can't wear an item
    hideSetCompletion   : false,	// Hide the set completion
    showItemColor       : true,		// Show the item color at the end of the desc
    drawCursor          : true,		// Draw the cursor
    drawSockets         : true,		// Draw sockets and socketed items
    drawEthereal        : true,		// Draw ethereal item gfx

    // ------ No touchy ------

    font:   (function () { WebFont.load({custom: {families: ['AvQuest']}}); return "AvQuest";   }).call(),
    hand:   (function () { let img = new Image(); img.src = "assets/hand.png";      return img; }).call(),
    socket: (function () { let img = new Image(); img.src = "assets/gemsocket.png"; return img; }).call(),

    bgnd: [
        (function () { let img = new Image(); img.src = "assets/bgnd1.png"; return img; }).call(),
        (function () { let img = new Image(); img.src = "assets/bgnd2.png"; return img; }).call(),
        (function () { let img = new Image(); img.src = "assets/bgnd3.png"; return img; }).call(),
        (function () { let img = new Image(); img.src = "assets/bgnd4.png"; return img; }).call()
    ],

    textColorMap: {
        0: "#C4C4C4",      // WHITE
        1: "#B04434",      // RED
        2: "#18FC00",      // SET
        3: "#787CE7",      // MAGIC
        4: "#948064",      // UNIQUE
        5: "#505050",      // DARK GRAY
        6: "#000000",      // BLACK (UNUSED)
        7: "#AC9C64",      // OCHER (UNUSED)
        8: "#D08420",      // CRAFT
        9: "#D8B864",      // RARE
        10: "#186408",     // DARK GREEN (UNUSED)
        11: "#A420FC",     // PURPLE (UNUSED)
        12: "#287C14"      // GREEN (UNUSED)
    },

    colorStrings: [
        "Unknown Color",//0
        "Black",		//1
        "Unknown Color",//2
        "Black",		//3
        "Light Blue", 	//4
        "Dark Blue",	//5
        "Crystal Blue",	//6
        "Light Red",	//7
        "Dark Red",		//8
        "Crystal Red",	//9
        "Light Green",	//10
        "Dark Green",	//11
        "Crystal Green",//12
        "Light Yellow",	//13
        "Dark Yellow",	//14
        "Light Gold",	//15
        "Dark Gold",	//16
        "light Purple",	//17
        "Dark Purple",	//18
        "Orange",		//19
        "White"			//20
    ],

    getItemDesc: function (desc) {
        var i, out = [], setCompletionInd,
            stringColor = 0;
    
        if (!desc) {
            return out;
        }

        var lines = desc.split("\n");
        
        for (var line in lines) {
            out.push({ text: lines[line], color: [0] });
        }

        for (i = out.length - 1; i >= 0; i -= 1) {
            if (out[i].text.indexOf("Sell value: ") > -1) {
                out.splice(i, 1);
    
                i += 1;
            } else {
                if (i === 0 && this.hideItemLevel && out[i].text.indexOf(" (") > -1) {
                    out[i].text = out[i].text.split(" (")[0];
                }

                out[i].text = out[i].text.replace(/^((xffc)|ÿc)/, "");
				out[i].text = out[i].text.replace(/[0-9]((xffc)|ÿc)/g, "");
                
                if (this.hideRequirements && out[i].text.match(/^1/) &&
                    (out[i].text.match(/(strength:)/i) ||
                    out[i].text.match(/(dexterity:)/i) ||
                    out[i].text.match(/(level:)/i) ||
                    out[i].text.match(/(only\))$/i)) ){
                    out[i].color[0] = 0;
                } else {
                    out[i].color[0] = parseInt(out[i].text[0]);
                }

                if (i > 3 && out[i].color[0] === 4) {
                    setCompletionInd = i;
                }

				out[i].text = out[i].text.substring(1);

                if (out[i].text.match(/(xffc)|ÿc/))
                    out[i].color.push(3);
			
			}

            out[i].text = out[i].text.replace(/((xffc)|ÿc)([0-9!"+<;.*])/g, "\$");
            out[i].text = out[i].text.replace(/\\/g, "");
        }

        if (this.hideSetCompletion && setCompletionInd) {
            out = out.slice(0, setCompletionInd);
        }
        
        return out;
    },

    cleanDecription: function (description) {
        return this.getItemDesc(description.toString().split("$")[0]);
    },

    create: function (item) {
        var iStart = Date.now();
        var strArray1 = this.cleanDecription(item.description);
        var num1 = 0;
        var tmp = document.createElement('canvas');
        var ctx = tmp.getContext('2d');
        ctx.font = "bold 1.5em AvQuest";
		
        for (var line in strArray1) {
            let size = this.fastMode ? ctx.measureText(strArray1[line].text) : Font16.measureText(strArray1[line].text);
            if (size.width > num1) {
                num1 = size.width;
            }
        }

        if (this.showItemColor && item.itemColor !== -1) {
            strArray1.push({ text: "", color: [5]});
            strArray1.push({ text: this.colorStrings[item.itemColor], color: [5]});
        }
        
        if (num1 < 100)
            num1 = 100;
            
        num2 = 16;
        
        if (item.itemColor === -1) {
            item.itemColor = 21;
        }

        var image = new Image();
        image.src = "assets/gfx/" + item.image + "/" + item.itemColor + ".png";
        
        image.onload = () => {
            var X, Y, Top, Left = 0
        
            if (image.height < 30) {
                Y = 1;
                Top = 32;
            } else if (image.height < 65) {
                Y = 2;
                Top = 61;
            } else if (image.height < 95) {
                Y = 3;
                Top = 90;
            } else {
                Y = 4;
                Top = 119;
            }
            
            if (image.width < 37) {
                X = 1;
                Left = 213; // 212 originally
            } else {
                X = 2;
                Left = 226;
            }
            
            var canvas = document.createElement('canvas');
            canvas.width = num1 + 14;
            canvas.height = num2 * strArray1.length + Top + 1;
            document.getElementById("itemList").append(canvas);
            var graphics = canvas.getContext('2d');
            
            //console.log("Setting black canvas")
            graphics.fillStyle = "rgba(10, 10, 10, 1)";
            graphics.fillRect(0, 0, canvas.width, canvas.height);
            
            //console.log("Drawing background");
            graphics.drawImage(this.bgnd[Y-1], canvas.width / 2 - Left, -9); // top -10 originally

            //console.log("Drawing item-active background");
            if (this.drawCursor) {
                graphics.fillStyle = "rgba(0, 128, 0, 0.1)";
            } else {
                graphics.fillStyle = "rgba(0, 0, 255, 0.1)";
            }
            graphics.fillRect((canvas.width - image.width) / 2, 5, image.width, image.height);
            
            //console.log("Drawing item gfx")
            if (this.drawEthereal && item.description.toLowerCase().indexOf("ethereal") > -1) graphics.globalAlpha = 0.5;
            graphics.drawImage(image, Math.round((canvas.width - image.width) / 2), 5);
            graphics.globalAlpha = 1.0;
            
            if (this.drawSockets) {
                let num3 = Math.round((canvas.width - image.width) / 2);
                let num4 = num3 + 14;
                let num5 = num4 + 14;
                let num6 = 5;
                let num7 = 34;
                let num8 = 63;
                let num9 = 92;
                let num10 = 14;
                let num11 = 1;
                let num12 = -1;
                
                let socketPositions = [];
                
                switch (item.sockets.length) {
                case 1:
                    if(Y === 2) {
                        if(X === 1) {
                            socketPositions.push({ x: num3 + num11, y: num6 + num10 + num12});
                            break;
                        }
                        socketPositions.push({ x: num4 + num11, y: num6 + num10 + num12});
                        break;
                    }
                    if (Y === 3) {
                        if (X === 1) {
                            socketPositions.push({ x: num3 + num11, y: num7 + num12});
                            break;
                        }
                        socketPositions.push({ x: num4 + num11, y: num7 + num12});
                        break;
                    }
                    if (X === 1) {
                        socketPositions.push({ x: num3 + num11, y: num7 + num10 + num12});
                        break;
                    }
                    socketPositions.push({ x: num4 + num11, y: num7 + num10 + num12});
                    break;
                case 2:
                    if(Y === 2) {
                        if(X === 1) {
                            socketPositions.push({ x: num3 + num11, y: num6 + num12});
                            socketPositions.push({ x: num3 + num11, y: num7 + num12});
                            break;
                        }
                        socketPositions.push({ x: num4 + num11, y: num6 + num12});
                        socketPositions.push({ x: num4 + num11, y: num7 + num12});
                        break;
                    }
                    if (Y === 3) {
                        if (X === 1) {
                            socketPositions.push({ x: num3 + num11, y: num6 + num10 + num12});
                            socketPositions.push({ x: num3 + num11, y: num7 + num10 + num12});
                            break;
                        }
                        socketPositions.push({ x: num4 + num11, y: num6 + num10 + num12});
                        socketPositions.push({ x: num4 + num11, y: num7 + num10 + num12});
                        break;
                    }
                    if (X === 1) {
                        socketPositions.push({ x: num3 + num11, y: num6 + num10 + num12});
                        socketPositions.push({ x: num3 + num11, y: num8 + num10 + num12});
                        break;
                    }
                    socketPositions.push({ x: num4 + num11, y: num6 + num10 + num12});
                    socketPositions.push({ x: num4 + num11, y: num8 + num10 + num12});
                    break;
                case 3:
                    if(Y === 2) {
                        socketPositions.push({ x: num3 + num11, y: num6 + num12});
                        socketPositions.push({ x: num5 + num11, y: num6 + num12});
                        socketPositions.push({ x: num4 + num11, y: num7 + num12});
                        break;
                    }
                    if (Y === 3) {
                        if (X === 1) {
                            socketPositions.push({ x: num3 + num11, y: num6 + num12});
                            socketPositions.push({ x: num3 + num11, y: num7 + num12});
                            socketPositions.push({ x: num3 + num11, y: num8 + num12});
                            break;
                        }
                        socketPositions.push({ x: num4 + num11, y: num6 + num12});
                        socketPositions.push({ x: num4 + num11, y: num7 + num12});
                        socketPositions.push({ x: num4 + num11, y: num8 + num12});
                        break;
                    }
                    if (X === 1) {
                        socketPositions.push({ x: num3 + num11, y: num6 + num10 + num12});
                        socketPositions.push({ x: num3 + num11, y: num7 + num10 + num12});
                        socketPositions.push({ x: num3 + num11, y: num8 + num10 + num12});
                        break;
                    }
                    socketPositions.push({ x: num4 + num11, y: num6 + num10 + num12});
                    socketPositions.push({ x: num4 + num11, y: num7 + num10 + num12});
                    socketPositions.push({ x: num4 + num11, y: num8 + num10 + num12});
                    break;
                case 4:
                    if (Y === 3) {
                        socketPositions.push({ x: num3 + num11, y: num6 + num10 + num12});
                        socketPositions.push({ x: num5 + num11, y: num6 + num10 + num12});
                        socketPositions.push({ x: num3 + num11, y: num7 + num10 + num12});
                        socketPositions.push({ x: num5 + num11, y: num7 + num10 + num12});
                        break;
                    }
                    if (Y === 2) {
                        socketPositions.push({ x: num3 + num11, y: num6 + num12});
                        socketPositions.push({ x: num5 + num11, y: num6 + num12});
                        socketPositions.push({ x: num3 + num11, y: num7 + num12});
                        socketPositions.push({ x: num5 + num11, y: num7 + num12});
                        break;
                    }
                    if(X === 1) {
                        socketPositions.push({ x: num3 + num11, y: num6 + num12});
                        socketPositions.push({ x: num3 + num11, y: num7 + num12});
                        socketPositions.push({ x: num3 + num11, y: num8 + num12});
                        socketPositions.push({ x: num3 + num11, y: num9 + num12});
                        break;
                    }
                    socketPositions.push({ x: num4 + num11, y: num6 + num12});
                    socketPositions.push({ x: num4 + num11, y: num7 + num12});
                    socketPositions.push({ x: num4 + num11, y: num8 + num12});
                    socketPositions.push({ x: num4 + num11, y: num9 + num12});
                    break;
                case 5:
                    if (Y === 3) {
                        socketPositions.push({ x: num3 + num11, y: num6 + num12});
                        socketPositions.push({ x: num5 + num11, y: num6 + num12});
                        socketPositions.push({ x: num4 + num11, y: num7 + num12});
                        socketPositions.push({ x: num3 + num11, y: num8 + num12});
                        socketPositions.push({ x: num5 + num11, y: num8 + num12});
                        break;
                    }
                    socketPositions.push({ x: num3 + num11, y: num6 + num10 + num12});
                    socketPositions.push({ x: num5 + num11, y: num6 + num10 + num12});
                    socketPositions.push({ x: num4 + num11, y: num7 + num10 + num12});
                    socketPositions.push({ x: num3 + num11, y: num8 + num10 + num12});
                    socketPositions.push({ x: num5 + num11, y: num8 + num10 + num12});
                    break;
                case 6:
                    if (Y === 3) {
                        socketPositions.push({ x: num3 + num11, y: num6 + num12});
                        socketPositions.push({ x: num5 + num11, y: num6 + num12});
                        socketPositions.push({ x: num3 + num11, y: num7 + num12});
                        socketPositions.push({ x: num5 + num11, y: num7 + num12});
                        socketPositions.push({ x: num3 + num11, y: num8 + num12});
                        socketPositions.push({ x: num5 + num11, y: num8 + num12});
                        break;
                    }
                    socketPositions.push({ x: num3 + num11, y: num6 + num10 + num12});
                    socketPositions.push({ x: num5 + num11, y: num6 + num10 + num12});
                    socketPositions.push({ x: num3 + num11, y: num7 + num10 + num12});
                    socketPositions.push({ x: num5 + num11, y: num7 + num10 + num12});
                    socketPositions.push({ x: num3 + num11, y: num8 + num10 + num12});
                    socketPositions.push({ x: num5 + num11, y: num8 + num10 + num12});
                    break;
                default:
                    break;
                }

                for (var i = 0; i < item.sockets.length && socketPositions.length; i++) {
                    graphics.globalAlpha = 0.3;
                    graphics.drawImage(
                        this.socket,
                        socketPositions[i].x - 2,
                        socketPositions[i].y + 1
                    );
                    graphics.globalAlpha = 1.0;

                    if (item.sockets[i] === "gemsocket") continue;
                    var img = new Image();
                    img.src = "assets/gfx/" + item.sockets[i] + "/21.png";
                    img.onload = (function(pos) {
                        return function() {
                            graphics.drawImage(
                                this,  // Socketed item
                                pos.x, // X
                                pos.y  // Y
                            );
                        };
                    })(socketPositions[i]);
                }
            }

            //console.log("Drawing text");
            
            if (this.fastMode) {
				graphics.font = ctx.font;
				graphics.filter = "blur(0.2px)";
                
				for (var index in strArray1) {
                    let pos = {
                        x: canvas.width / 2,
                        y: (index * num2 + Top + num2 - 3) // -1 originally
                    };
                    
                    graphics.fillStyle = this.textColorMap[strArray1[index].color[0]];
                    
                    if (strArray1[index].color.length > 1) {
						let parts = strArray1[index].text.split("$");
                        let leftText = parts.shift();
                        let rightText = parts.join('');
                        shift = (ctx.measureText(leftText).width + ctx.measureText(rightText).width) / 2;
                        graphics.textAlign = "left";
                        graphics.fillText(leftText, Math.round(pos.x - shift), Math.round(pos.y));
                        graphics.fillStyle = this.textColorMap[strArray1[index].color[1]];
                        graphics.fillText(strArray1[index].text.split("$")[1], Math.round(pos.x + ctx.measureText(leftText).width - shift), Math.round(pos.y));
                    } else {
                        graphics.textAlign = "center";
                        graphics.fillText(strArray1[index].text, Math.round(pos.x), Math.round(pos.y));
                    }
                }
                graphics.filter = "None";
            } else {
                var index = 0;
                strArray1.forEach((line) => {
                    let pos = {
                        x: canvas.width / 2,
                        y: (index * num2 + Top - 1)
                    };
                    
                    shift = Font16.measureText(line.text).width / 2;
                    
                    if (line.color.length > 1) {
						let parts = line.text.split("$");
                        let leftText = parts.shift();
                        let rightText = parts.join('');
                        // Apply back half the wrong measured kerning for char '$' width 10 / 2 = 5
                        Font16.drawText(graphics, pos.x - shift + 5, pos.y, leftText, line.color[0]);
                        Font16.drawText(graphics, pos.x - shift + 5 + Font16.measureText(leftText).width, pos.y, rightText, line.color[1]);
                    } else {
                        Font16.drawText(graphics, pos.x - shift, pos.y, line.text, line.color[0]);
                    }
                    index += 1;
                });
            }
            
            if (this.drawCursor) {
                //console.log("Drawing cursor");
                graphics.drawImage(this.hand, Math.round((canvas.width + image.width) / 2) - 5, 5 + 5);
            }

            console.log("Creating item screenshot took " + (Date.now() - iStart) + "ms");
        }
    }
}
