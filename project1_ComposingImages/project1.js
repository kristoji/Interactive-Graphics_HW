// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{    
    
    for (var i = 0; i < fgImg.width; i++)
    {
        for (var j = 0; j < fgImg.height; j++)
        {
            if ( fgPos.x + i < 0 || fgPos.x + i >= bgImg.width || fgPos.y + j < 0 || fgPos.y + j >= bgImg.height )
            {
                continue;
            }

            var fgAlpha = fgImg.data[(j * fgImg.width + i)*4 + 3] / 255.0;
            var bgAlpha = bgImg.data[((fgPos.y + j) * bgImg.width + (fgPos.x + i))*4 + 3] / 255.0;
            
            fgAlpha = fgOpac * fgAlpha;
            var alpha = fgAlpha + (1 - fgAlpha) * bgAlpha;

            for (var k = 0; k < 3; k++)
            {
                var fgPixel = fgImg.data[(j * fgImg.width + i)*4 + k];
                var bgPixel = bgImg.data[((fgPos.y + j) * bgImg.width + (fgPos.x + i))*4 + k];
                
                var newPixel = fgAlpha * fgPixel + (1 - fgAlpha) * bgAlpha * bgPixel;

                bgImg.data[((fgPos.y + j) * bgImg.width + (fgPos.x + i))*4 + k] = newPixel / alpha;
            }

            bgImg.data[((fgPos.y + j) * bgImg.width + (fgPos.x + i))*4 + 3] = alpha * 255;            
        }
    }
}
