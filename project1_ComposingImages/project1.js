function get_value(img, x, y, channel)
{
    return img.data[(y * img.width + x) * 4 + channel];
}

function set_value(img, x, y, channel, value)
{
    img.data[(y * img.width + x) * 4 + channel] = value;
}


// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{    
    
    for (var j = 0; j < fgImg.height; j++)
    {
        for (var i = 0; i < fgImg.width; i++)
        {
            if ( fgPos.x + i < 0 || fgPos.x + i >= bgImg.width || fgPos.y + j < 0 || fgPos.y + j >= bgImg.height )
            {
                continue;
            }

            var fgAlpha = get_value(fgImg, i, j, 3) / 255.0;
            var bgAlpha = get_value(bgImg, fgPos.x + i, fgPos.y + j, 3) / 255.0;
            
            fgAlpha = fgOpac * fgAlpha;
            var alpha = fgAlpha + (1 - fgAlpha) * bgAlpha;

            for (var k = 0; k < 3; k++)
            {
                var fgPixel = get_value(fgImg, i, j, k);
                var bgPixel = get_value(bgImg, fgPos.x + i, fgPos.y + j, k);
                
                var newPixel = fgAlpha * fgPixel + (1 - fgAlpha) * bgAlpha * bgPixel;

                set_value(bgImg, fgPos.x + i, fgPos.y + j, k, newPixel / alpha);
            }

            set_value(bgImg, fgPos.x + i, fgPos.y + j, 3, alpha * 255.0);      
        }
    }
}
