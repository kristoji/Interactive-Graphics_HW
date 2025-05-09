var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	for ( int i=0; i<NUM_LIGHTS; ++i ) 
	{
		// TO-DO: Check for shadows

		vec3 point_light_distance = lights[i].position - position;
		vec3 shadowRayDir = normalize(point_light_distance);
		Ray shadowRay = Ray( position + normal * 1e-5, shadowRayDir );
		HitInfo shadowHit;
		if ( IntersectRay( shadowHit, shadowRay ) ) {
			if ( shadowHit.t > 1e-5 && shadowHit.t < length(point_light_distance) ) {
				// shadow hit found, so skip this light
				continue;
			}
		}

		
		// TO-DO: If not shadowed, perform shading using the Blinn model
		// color += mtl.k_d * lights[i].intensity;	// change this line

		vec3 w = normalize( lights[i].position - position );	// light Direction
		vec3 h = normalize( view + w);
		float cos_phi = max(0.0, dot( normal, h));
		float cos_theta = max(0.0, dot( normal, w));
		vec3 f_r_cos_theta = cos_theta*mtl.k_d + mtl.k_s * pow( cos_phi, mtl.n );
		color += lights[i].intensity*f_r_cos_theta; 
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	float eps = 1e-5;	// epsilon to avoid self-intersection

	for ( int i=0; i<NUM_SPHERES; ++i ) 
	{
		// TO-DO: Test for ray-sphere intersection
	
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(ray.dir, ray.pos - spheres[i].center);
		float c = dot(ray.pos - spheres[i].center, ray.pos - spheres[i].center) - spheres[i].radius * spheres[i].radius;

		float d = b * b - 4.0 * a * c;	// discriminant
		if ( d < 0.0 ) continue;	// no intersection

		// TO-DO: If intersection is found, update the given HitInfo

		float t = (-b - sqrt(d)) / (2.0 * a);	// the smaller root
		if ( t < eps ) continue;	// intersection is behind the ray

		if ( t < hit.t ) 
		{
			hit.t = t;
			hit.position = ray.pos + t * ray.dir;	// intersection point
			hit.normal = normalize( hit.position - spheres[i].center );	// normal at the intersection point
			hit.mtl = spheres[i].mtl;	// material of the sphere
			foundHit = true;
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) 
		{
			if ( bounce >= bounceLimit ) break;
		
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			vec3 w_r = 2.0 * dot( view, hit.normal ) * hit.normal - view;
			r.pos = hit.position+ hit.normal * 1e-5;
			r.dir = normalize( w_r );
			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				vec3 reflectionColor = Shade( h.mtl, h.position, h.normal, -r.dir );

				// TO-DO: Update the loop variables for tracing the next reflection ray
				clr += k_s * reflectionColor;
				k_s *= h.mtl.k_s;	// update the reflection coefficient
				hit = h;			// update the hit info for the next bounce
				view = -r.dir;		// update the view direction for the next bounce
			
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;