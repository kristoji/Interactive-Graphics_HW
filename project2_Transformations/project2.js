function switch_row_column_major( m )
{
	return Array( 	m[0], m[3], m[6],
					m[1], m[4], m[7],
					m[2], m[5], m[8] );
}

function mat_mul_row_major( a, b )
{
	var c = Array( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
	for (var i = 0; i < 3; i++)
		for (var j = 0; j < 3; j++)
			for (var k = 0; k < 3; k++)
				c[i*3 + j] += a[i*3 + k] * b[k*3 + j];
	return c;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	// All transformations are wrt the origin (0,0), so the order is reversed

	var t_scale = Array( 	scale, 0, 0,
							0, scale, 0,
							0, 0, 1 );
						
	var angle = rotation * Math.PI/180;
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);

	var t_rot = Array( 	cos, -sin,0, 
						sin, cos,0, 
						0, 0, 1 );

	var t_trans = Array( 	1, 0, positionX,
							0, 1, positionY,
							0, 0, 1 );

	var t = mat_mul_row_major(t_trans, t_rot);
	t = mat_mul_row_major(t, t_scale);
	
	return switch_row_column_major(t);

}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	// All transformations are wrt the origin (0,0), so the order is reversed

	t2_row = switch_row_column_major(trans2);
	t1_row = switch_row_column_major(trans1);
	return switch_row_column_major(mat_mul_row_major(t2_row, t1_row));
}
