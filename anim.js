/** Copyright 2013 mocking@gmail.com * http://github.com/relay/anim

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

var anim = function(A) {
"use strict";

A = function(n, g, t, e) {
  var a, o, c,
    q = [],
    cb = function(i) {
      if(i = q.shift()) i[1] ?
          A.apply(this, i).anim(cb) :
          i[0] > 0 ? setTimeout(cb, i[0]*1000) : (i[0](), cb())
    };

  if(n.charAt) n = document.getElementById(n);
  if(n > 0 || !n) g = {}, t = 0, cb(q = [[n || 0]]);

  expand(g, {padding:0, margin:0, border:"Width"}, [T, R, B, L]);
  expand(g, {borderRadius:"Radius"}, [T+L, T+R, B+R, B+L]);

  ++mutex;

  for(a in g) {
    o = g[a];
    if(!o.to && o.to !== 0) o = g[a] = {to: o};  //shorthand
    A.defs(o, n, a, e);  //set defaults
  }

  A.iter(g, t*1000, cb);

  return {
    anim: function() {
      q.push([].slice.call(arguments));
      return this
    }
  }
};

var T="Top", R="Right", B="Bottom", L="Left",
  mutex = 1,

  //{border:1} => {borderTop:1, borderRight:1, borderBottom:1, borderLeft:1}
  expand = function(g, dim, dir, a, i, d, o) {
    for(a in g) {
      if(a in dim) {
        o = g[a];
        for(i = 0; d = dir[i]; i++)
          g[a.replace(dim[a], "") + d + (dim[a] || "")] = {
            to:(o.to === 0) ? o.to : (o.to || o), fr:o.fr, e:o.e
          };
        delete g[a];
      }
    }
  },

  timeout = function(w, a) {
    return w["webkitR"+a] || w["r"+a] || w["mozR"+a] || w["msR"+a] || w["oR"+a]
  }(window, "equestAnimationFrame");

A.defs = function(o, n, a, e, s) {
  s = n.style;
  o.a = a;
  o.n = n;
  o.s = (a in s) ? s : n;  //n.style||n
  o.e = o.e || e;

  o.fr = o.fr || (o.fr === 0 ? 0 : o.s == n ? n[a] :
        (window.getComputedStyle ? getComputedStyle(n, null) : n.currentStyle)[a]);

  o.u = (/\d(\D+)$/.exec(o.to) || /\d(\D+)$/.exec(o.fr) || [0, 0])[1];  //units

  o.fn = /color/i.test(a) ? A.fx.color : (A.fx[a] || A.fx._);

  o.mx = "anim_" + a;
  n[o.mx] = o.mxv = mutex;
  if(n[o.mx] != o.mxv) o.mxv = null;  //test expando
};

A.iter = function(g, t, cb) {
  var _, i, o, p, e,
    z = +new Date + t,

  _ = function(now) {
    i = z - (now || new Date().getTime());

    if(i < 50) {
      for(o in g)
        o = g[o],
        o.p = 1,
        o.fn(o, o.n, o.to, o.fr, o.a, o.e);

      cb && cb()

    } else {

      i = i/t;

      for(o in g) {
        o = g[o];

        if(o.n[o.mx] != o.mxv) return;

        e = o.e;
        p = i;

        if(e == "lin") {
          p = 1 - p
  
        } else if(e == "ease") {
          p = (0.5 - p)*2;
          p = 1 - ((p*p*p - p*3) + 2)/4
  
        } else if(e == "ease-in") {
          p = 1 - p;
          p = p*p*p
  
        } else {  //ease-out
          p = 1 - p*p*p
        }
        o.p = p;
        o.fn(o, o.n, o.to, o.fr, o.a, o.e)
      }
      timeout ? timeout(_) : setTimeout(_, 50, 0)
    }
  }
  _();
};

A.fx = {  //CSS names which need special handling
  _: function(o, n, to, fr, a, e) {
    fr = parseFloat(fr) || 0,
    to = parseFloat(to) || 0,
    o.s[a] = (o.p >= 1 ? to : (o.p*(to - fr) + fr)) + o.u
  },

  width: function(o, n, to, fr, a, e) {
    if(!(o._fr >= 0))
      o._fr = !isNaN(fr = parseFloat(fr)) ? fr : a == "width" ? n.clientWidth : n.clientHeight;
    A.fx._(o, n, to, o._fr, a, e)
  },

  opacity: function(o, n, to, fr, a, e) {
    if(isNaN(fr = fr || o._fr))
      fr = n.style,
      fr.zoom = 1,
      fr = o._fr = (/alpha\(opacity=(\d+)\b/i.exec(fr.filter) || {})[1]/100 || 1;
    fr *= 1;
    to = (o.p*(to - fr) + fr);
    n = n.style;
    if(a in n) {
      n[a] = to
    } else {
      n.filter = to >= 1 ? "" : "alpha(" + a + "=" + Math.round(to*100) + ")"
    }
  },

  color: function(o, n, to, fr, a, e, i, v) {
    if(!o.ok) {
      to = o.to = A.toRGBA(to);
      fr = o.fr = A.toRGBA(fr);
      if(to[3] == 0) to = [].concat(fr), to[3] = 0;
      if(fr[3] == 0) fr = [].concat(to), fr[3] = 0;
      o.ok = 1
    }

    v = [0, 0, 0, o.p*(to[3] - fr[3]) + 1*fr[3]];
    for(i=2; i>=0; i--) v[i] = Math.round(o.p*(to[i] - fr[i]) + 1*fr[i]);

    if(v[3] >= 1 || A.rgbaIE) v.pop();

    try {
      o.s[a] = (v.length > 3 ? "rgba(" : "rgb(") + v.join(",") + ")"
    } catch(e) {
      A.rgbaIE = 1
    }
  }
};
A.fx.height = A.fx.width;

A.RGBA = /#(.)(.)(.)\b|#(..)(..)(..)\b|(\d+)%,(\d+)%,(\d+)%(?:,([\d\.]+))?|(\d+),(\d+),(\d+)(?:,([\d\.]+))?\b/;
A.toRGBA = function(s, v) {
  v = [0, 0, 0, 0];
  s.replace(/\s/g, "").replace(A.RGBA, function(i, a,b,c, f,g,h, l,m,n,o, w,x,y,z) {
    var h = [a+a||f, b+b||g, c+c||h], p = [l, m, n];

    for(i=0; i<3; i++) h[i] = parseInt(h[i], 16), p[i] = Math.round(p[i]*2.55);

    v = [h[0]||p[0]||w||0,  h[1]||p[1]||x||0,  h[2]||p[2]||y||0,  o||z||1]
  });
  return v
};

return A
}();
