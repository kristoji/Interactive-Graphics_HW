// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
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

	mvp = MatrixMult( trans, rotationMatrix );
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		
        const vertex_shader_src = `
            attribute vec3 pos;
			attribute vec3 normal;
            attribute vec2 txc;

            uniform mat4 mvp;
			uniform mat4 mv;
			uniform mat3 mv_invt;
			uniform bool swapYZ;

            varying vec2 texCoord;
			varying vec3 cam_pos;
			varying vec3 vs_norm;

            void main()
            {
				vec4 pos_swp;
				vec3 normal_swp;
				if (swapYZ) {
					pos_swp = vec4(pos.x, pos.z, pos.y, 1.0);
					normal_swp = vec3(normal.x, normal.z, normal.y);
				}
				else 
				{
					pos_swp = vec4(pos, 1.0);
					normal_swp = normal;
				}
			
				gl_Position = mvp * pos_swp;
				
				texCoord = txc;
				// cam_pos = - obj_pos_vs;
				cam_pos = -vec3(mv * pos_swp);
				vs_norm = mv_invt * normal_swp;
            }
        `;

        const fragment_shader_src = `
			precision mediump float;

			uniform sampler2D tex;
			uniform bool showTexture;
			uniform float alpha;		// shininess coefficient
			uniform vec3 w;				// light direction	

			varying vec2 texCoord;
			varying vec3 cam_pos;
			varying vec3 vs_norm;

			void main()
			{
				// I, Ks, Kd as white
				// If showTexture is set and setTexture is called, 
				// the diffuse coefficient (Kd) should be replaced by the texture value.

				vec4 I = vec4(1, 1, 1, 1); 	// incoming light intensity
				vec4 Ks = vec4(1, 1, 1, 1); 	// specular reflection coefficient
				vec4 Kd = vec4(1, 1, 1, 1); 	// diffuse reflection coefficient

				if (!showTexture) 
					Kd = vec4(0, gl_FragCoord.z * gl_FragCoord.z, 1, 1);
				else
					Kd = texture2D(tex, texCoord);

				// blinn shading: C = I*(cos(theta)*Kd + Ks*(cos(phi))^alpha)
				float cos_theta = dot(vs_norm, w); 
				vec3 h = normalize(cam_pos + w); // half vector
				float cos_phi = dot(vs_norm, h);
				gl_FragColor = I * (cos_theta * Kd + Ks * pow(cos_phi, alpha));
			}
		`;
		
        this.program = gl.createProgram();
        this.program = InitShaderProgram(vertex_shader_src, fragment_shader_src);

        this.vert_buffer = gl.createBuffer();
		this.normals_buffer = gl.createBuffer();
        this.texCoord_buffer = gl.createBuffer();
		
        this.mytex = gl.createTexture();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		// this.numTriangles = vertPos.length;

		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normals_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

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
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);


        var mvp = gl.getUniformLocation(this.program, "mvp");
        gl.uniformMatrix4fv(mvp, false, matrixMVP);

		var mv = gl.getUniformLocation(this.program, "mv");
		gl.uniformMatrix4fv(mv, false, matrixMV);

		var mv_invt = gl.getUniformLocation(this.program, "mv_invt");
		gl.uniformMatrix3fv(mv_invt, false, matrixNormal);


        var p = gl.getAttribLocation(this.program, "pos");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_buffer);
        gl.vertexAttribPointer(p, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(p);
		
		var n = gl.getAttribLocation(this.program, "normal");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normals_buffer);
		gl.vertexAttribPointer(n, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(n);
        
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
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.program);
        var w = gl.getUniformLocation(this.program, "w");
		gl.uniform3f(w, x, y, z);

	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.program);
		var alpha = gl.getUniformLocation(this.program, "alpha");
		gl.uniform1f(alpha, shininess);
	}
}


// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	
	var forces = Array.from({ length: positions.length }, () => new Vec3(0, 0, 0));
	// console.log("Positions:", positions);
	// console.log("Velocities:", velocities);
	// console.log("Springs:", springs);
	// console.log("Forces:", forces);
	
	// [TO-DO] Compute the total force of each particle
	
	for (var i = 0; i < positions.length; i += 1) 
	{
		// gravity force
		forces[i].inc(gravity.mul(particleMass));
	}

	springs.forEach(spring => {
		var i = spring.p0;
		var j = spring.p1;
		var rest = spring.rest;

		// spring force
		var l = positions[j].sub(positions[i]);
		var l_norm = l.len();
		var d = l.unit();
		var Fs_j = d.mul(- stiffness * (l_norm - rest));
		
		// damping force
		var dl = velocities[j].sub(velocities[i]);
		var Fd_j = d.mul(-damping * dl.dot(d));

		// Add forces to both particles, F_i = -F_j
		forces[j].inc(Fs_j);
		forces[j].inc(Fd_j);
		forces[i].dec(Fs_j);
		forces[i].dec(Fd_j);
	});
	
	// [TO-DO] Update positions and velocities

	for (var i = 0; i < positions.length; i += 1)
	{
		var a_i = forces[i].div( particleMass ); // acceleration
		velocities[i].inc( a_i.mul( dt ) ); // update velocity
		positions[i].inc( velocities[i].mul( dt ) ); // update position
	}
	
	// [TO-DO] Handle collisions
	for (var i = 0; i < positions.length; i += 1) 
	{
		for (var dir in positions[i]) 
		{
			if (positions[i][dir] < -1 || positions[i][dir] > 1) 
			{
				// Reflect the particle's velocity
				velocities[i][dir] *= -restitution;

				var z = (positions[i][dir] < -1) ? -1 : 1;
				var h = positions[i][dir] - z;
				positions[i][dir] = z - restitution * h;
			}
		}
	}
	
}

