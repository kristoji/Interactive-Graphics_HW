// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rotationXMatrix_X = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];
	var rotationYMatrix_Y = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	var rotationMatrix = MatrixMult( rotationXMatrix_X, rotationYMatrix_Y );

	var mvp = MatrixMult( projectionMatrix, trans );
	mvp = MatrixMult( mvp, rotationMatrix );
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.


// inspired by https://www.youtube.com/watch?v=WULOKMqEGA0

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations

        const vertex_shader_src = `
            attribute vec3 pos;
            attribute vec2 txc;

            uniform mat4 trans;
			uniform bool swapYZ;

            varying vec2 texCoord;

            void main()
            {
				if (swapYZ) 
					gl_Position = trans * vec4(pos.x, pos.z, pos.y, 1.0);
                else 
					gl_Position = trans * vec4(pos, 1.0);
                
				texCoord = txc;
            }
        `;

        const fragment_shader_src = `
            precision mediump float;

            uniform sampler2D tex;
			uniform bool showTexture;

            varying vec2 texCoord;

            void main()
            {
				if (!showTexture) 
					gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
				else
					gl_FragColor = texture2D(tex, texCoord);
            
            }
        `;


        // const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        // gl.shaderSource(vertex_shader, vertex_shader_src);
        // gl.compileShader(vertex_shader);
        
        // if ( ! gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS) ) {
        //     alert( gl.getShaderInfoLog(vertex_shader) );
        //     gl.deleteShader(vertex_shader);
        // }

        // const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        // gl.shaderSource(fragment_shader, fragment_shader_src);
        // gl.compileShader(fragment_shader);

        // if ( ! gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS) ) {
        //     alert( gl.getShaderInfoLog(fragment_shader) );
        //     gl.deleteShader(fragment_shader);
        // }

        // this.program = gl.createProgram();
        // gl.attachShader(this.program, vertex_shader);
        // gl.attachShader(this.program, fragment_shader);
        // gl.linkProgram(this.program);

        // if ( ! gl.getProgramParameter(this.program, gl.LINK_STATUS) ) {
        //     alert( gl.getProgramInfoLog(this.program) );
        // }
        
        this.program = gl.createProgram();
        this.program = InitShaderProgram(vertex_shader_src, fragment_shader_src);


        this.vert_buffer = gl.createBuffer();
        
        this.texCoord_buffer = gl.createBuffer();

        this.mytex = gl.createTexture();

	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.

	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length;

		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		
		gl.useProgram(this.program);
        var syz = gl.getUniformLocation(this.program, "swapYZ");
        gl.uniform1i(syz, swap);

	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);

        var m = gl.getUniformLocation(this.program, "trans");
        gl.uniformMatrix4fv(m, false, trans);

        var p = gl.getAttribLocation(this.program, "pos");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_buffer);
        gl.vertexAttribPointer(p, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(p);
        
        var t = gl.getAttribLocation(this.program, "txc");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
        gl.vertexAttribPointer(t, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(t);

    
        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
        gl.clear(gl.COLOR_BUFFER_BIT);

		// [TO-DO] Bind the texture
        gl.bindTexture(gl.TEXTURE_2D, this.mytex);
		
		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
        gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		
		gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, this.mytex);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
        gl.useProgram(this.program);

		var sampler = gl.getUniformLocation(this.program, "tex");
        gl.uniform1i(sampler, 0);

		var st = gl.getUniformLocation(this.program, "showTexture");
        gl.uniform1i(st, 1);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.

		gl.useProgram(this.program);
        var st = gl.getUniformLocation(this.program, "showTexture");
        gl.uniform1i(st, show);

	}
	
}
