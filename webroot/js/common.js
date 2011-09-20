// CatfoOD 2009.12.9
// charset: UTF-8
// v0.21

(function() {
	var head = document.getElementsByTagName("head")[0];
	var srps = head.getElementsByTagName("script");
	
	for (var i=0; i<srps.length; ++i) {
		var index = srps[i].src.indexOf("JSX/common.js");
		
		if (index>=0) {
			path = srps[i].src.substring(0, index);
			path = path + "JSX/"
			
			include(path + "ajax.js");
			include(path + "dom.js");
			include(path + "selector.js");
			include(path + "cookie.js");
			include(path + "fixfirefox.js");
			break;
		}
	}
})();

/**
 * 等待id指定的标记加载结束，并执行alertfunc指定的表达式
 * 
 * @param alertfunc - 表达式字符串，通常为函数
 * @param id - 标记的id
 */
function waitTag(alertfunc, id) {
	var func = function() {
		if (getByid(id)===null) {
			setTimeout(func, 100);
		} else {
			if (typeof alertfunc==='function') {
				alertfunc();
			}
			else {
				eval(alertfunc);
			}
		}
	}
	func();
}

/** 等待res资源加载完成, 后执行whenFinish方法 */
function waitRes(res, whenFinish) {
	var _w = function() {
		res ? whenFinish() : setTimeout(_w, 500);
	}; _w();
}

/**
 * 给表单tag绑定onchange事件,该方法不会引起问题
 * 当表单的值value放生改变时激活eventHandle,这是一个轮询的方法
 * 效率不高,而且改变后会有延迟
 * @param {} input_tag
 * @param {} eventHandle
 */
function onchange(input_tag, eventHandle) {
	var name = 'jym.jsx.onchange.handles.cache';
	
	if (input_tag && typeof eventHandle=='function') {
		var handles = window[name];
		if (!handles) {
			window[name] = handles = [];
			setInterval(function() {
				for (var h in handles) { 
					handles[h]();
				}
			}, 500);
		}
		
		var oldvalue = input_tag.value;
		handles.push(function() {
			if (input_tag.value != oldvalue) {
				eventHandle();
				oldvalue = input_tag.value;
			}
		});
	} else {
		throw new Error("参数错误");
	}
}

function waitBody(alertfunc) {
	var f = function() {
		if (!document.body) {
			setTimeout(f, 100);
		} else {
			if (typeof alertfunc==='function') {
				alertfunc();
			}
			else {
				eval(alertfunc);
			}
		}
	}
	f();
}

/**
 * 移动divid指定的层到屏幕的中央
 * 
 * @param divid
 * @return 返回divid的对象
 */
function moveCenter(divid) {
	var div = getByid(divid);
	var w = div.style.width;
	var h = div.style.height;
	var x = (document.documentElement.clientWidth - w)/2
	var y = (document.documentElement.clientHeight - h)/2
	div.style.top = y;
	div.style.left = x;
	
	return div;
}


function getByid(id) {
	try {
		return document.getElementById(id);
	} catch(e) {
		return null;
	}
}

/**
 * 显示一个错误消息到状态条，并添加到文档末尾
 */
function showError(msg) {
	window.status = msg;
	var ediv = document.createElement("div");
	ediv.style.color = "#FF0000";
	ediv.style.fontSize = "11px";
	ediv.innerHTML = msg;
	insertDom(document.body, ediv);
}

/**
 * 向obj对象的末尾添加dom元素
 */
function insertDom(obj, dom) {
	try {
		var a = obj.appendChild(dom);
	} catch(e) {
		obj.insertAdjacentElement('afterEnd', dom);
	}
}

/**
 * 在targetEl元素的后面,插入newEl元素
 */
function insertAfter(newEl, targetEl) {
	var parentEl = targetEl.parentNode;

	if (parentEl.lastChild == targetEl) {
		parentEl.appendChild(newEl);
	} else {
		parentEl.insertBefore(newEl, targetEl.nextSibling);
	}
}

/**
 * 删除指定标签上所有与脚本交叉关联的对象,
 * 解决ie中内存泄漏的问题, 只在ie中起作用
 */
function removeAllCrossLink(_tag) {
	if (isie()) {
		var attrs = _tag.attributes;
		for (var name in attrs) {
			try {
				_tag[name] = null; 
			} catch(E) {
			}
		}
	}
}

/**
 * 当_dom_tag对象从dom树中被删除时，
 * 移除指定的事件
 */
function onremove(_dom_tag) {
	if (isie()) {
		var name = 'jym.jsx.onremove.event.cache';
		var handles = window[name];
		
		if (!handles) {
			handles = window[name] = [];
			var index = 0; 
			
			var _check = function() {
				if (index < index.length) {
					++index;
				} else {
					index = 0;
				}
				if (handles[index] && handles[index]()) {
					delete handles[index];
				}
				setTimeout(_check, 800);
			}
			_check();
		}
		
		handles.push(function() {
			var _p = _dom_tag.parentElement;
			if (!_p) {
				removeAllCrossLink(_dom_tag);
			}
			return !_p; 
		});
	}
}

/**
 * 包含入filename指定的js脚本文件<br>
 * 包含文件的目录相对于html文档的目录,或'/'开始相对网站目录<br>
 * 
 * 包含的脚本在body加载完毕后可用<br>
 */
function include(filename) {
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	script.src = filename;
	script.type= "text/javascript";

	insertDom(head, script);
}

/**
 * 包含入filename指定的样式表文件<br>
 * 包含文件的目录相对于html文档的目录,或'/'开始相对网站目录<br>
 * 
 * 包含的脚本在body加载完毕后可用<br>
 */
function includecss(cssfilename) {
	var head = document.getElementsByTagName("head")[0];
	var css = document.createElement("link");
	css.rel = "stylesheet";
	css.type = "text/css";
	css.href = cssfilename;
	
	insertDom(head, css);
}

/**
 * 收集formid的表单值对，格式化为x-www-form-urlencoded
 */
function getFormData(formid) {
	var formtext = new Array();
	var form = getByid(formid);
	if (!form) {
		form = formid;
	}
	
	var pushvalue = function(name, value, last) {
		formtext.push( name );
		formtext.push( '=' );
		formtext.push( encodeUri(value) );
		if (!last) {
			formtext.push( '&' );
		}
	}
	
	var inputs = form.getElementsByTagName("input");
	for (var i=0; i<inputs.length; ++i) {
		if (inputs[i].disabled) continue;
		
		if (inputs[i].type=='checkbox' || inputs[i].type=='radio') {
			if (!inputs[i].checked) {
				continue;
			}
		}
		pushvalue(inputs[i].name, inputs[i].value);
	}
	
	var selects = form.getElementsByTagName("select");
	for (var i=0; i<selects.length; ++i) {
		if (selects[i].disabled) continue;
		pushvalue(selects[i].name, selects[i].value);
	}
	
	var textareas = form.getElementsByTagName("textarea");
	for (var i=0; i<textareas.length; ++i) {
		if (textareas[i].disabled) continue;
		pushvalue(textareas[i].name, textareas[i].innerText);
	}
	
	return formtext.join('');
}

/**
 * 创建XMLHttpRequest对象
 * 失败返回false
 */
function creatHttpRequest() {
	var http = false;
	
	if (window.XMLHttpRequest) {
		http = new XMLHttpRequest();
	}
	
	else if (window.ActiveXObject) {
		try {
			http = new ActiveXObject("MSXML2.XMLHttp.3.0");
		} catch(e) {
			try {
				http = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e1) {}
		}
	}
	
	return http;
}

/**
 * 替代encodeURIComponent编码
 * 对中文字符不进行转换
 */
function encodeUri(uri) {
	var cachename = "net.jym.js.encodeUri";
	var signs = null;
	if (!window[cachename]) {
		signs = new Array();
		signs[' '] = "%20";	
		signs['/'] = "%2F";
		signs['%'] = "%25";
		signs['\\']= "%5C";
		signs['='] = "%3D";
		signs['&'] = "%26";
		signs[':'] = "%3A";
		window[cachename] = signs;
	} else {
		signs = window[cachename];
	}
	
	var newuri = new Array();
	
	for (var i=0; i<uri.length; ++i) {
		var ch = uri.charAt(i);
		if (signs[ch]) {
			newuri.push(signs[ch]);
		} else {
			newuri.push(ch);
		}
	}
	
	return newuri.join('');
}

function getDiv(divid) {
	var div = null;
	if (typeof divid === "string") {
		div = getByid(divid);
	} else {
		div = divid;
	}
	return div;
}

/**
 * 显示div,参数可以是id也可以是div对象<br>
 * aftershow()在显示后作
 */
function showDiv(divid, aftershow) {
	var div = getDiv(divid);
	var strength = 100;
	
	div.style.display = "block";
	anim(function(alpha) {
		if (0 && isie()) {
			div.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity="+alpha+") "
					+ "progid:DXImageTransform.Microsoft.MotionBlur(Strength="+strength+",Direction=200);";
		} else {
			setOpacity(div, alpha);
		}
		strength = 70-alpha;
	}, 0, 100, 700, aftershow);
}

/**
 * 隐藏div,参数可以是id也可以是div对象
 * afterhide()在隐藏后作
 */
function hideDiv(divid, afterhide) {
	var div = getDiv(divid);
	var strength = 1;
	
	anim(function(alpha) {
		if (0 &&isie()) {
			div.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity="+alpha+") "
					+ "progid:DXImageTransform.Microsoft.MotionBlur(Strength="+strength+",Direction=35);";
		} else {
			setOpacity(div, alpha);
		}
		strength+=2;
	}, 90, 0, 300, function() {
		div.style.display = "none";
		if (afterhide) {
			afterhide();
		}
	});
}

/**
 * 如果div已经显示返回true,否则返回false
 */
function divDisplay(divid) {
	var div = getDiv(divid);
	if (!div) div = divid;
	return div.style.display == "block";
}

/**
 * 返回标签的背景色
 */
function getBGColor(obj)  {
	var color = getStyle(obj).backgroundColor;
	return int2color(getColorInt(color));
}

/**
 * 取得html对象的style属性,该方法可以取得css中定义的值
 */
function getStyle(obj) {
	var style = null;
	if (isie()) {
		style = obj.currentStyle;
	} else {
		style = window.getComputedStyle(obj,null);
	}
	return style;
}


/**
 * 修改tableid指定的表的颜色，其颜色为隔行显示
 * 
 * @param tableid - 表格的id
 * @param fcolor - 奇数行的颜色
 * @param scolor - 偶数行的颜色
 * @param mousecolor - 鼠标悬停的颜色
 * @return 返回tableid的对象
 */
function changeTableColor(tableid, fcolor, scolor, mousecolor) {
	var table = getByid(tableid);
	if (table==null) table = tableid;
	
	var color = true;
	
	if (fcolor==null) {
		fcolor = '#FFFFFF';
	}
	if (scolor==null) {
		scolor = '#FFFFFF';
	}
	if (mousecolor==null) {
		mousecolor = '#ffaaaa';
	}
	
	var rows = table.rows;
	for (var i=0; i<rows.length; ++i) {
		var row = rows[i];
		
		if (color) {
			changeColor(row, fcolor);
		} else {
			changeColor(row, scolor);
		}
		color = !color;

		onMouseOverChangeColor(row, mousecolor);
	}
	
	return table;
}

/**
 * 表格行鼠标点击事件
 * 
 * @param tableid - 要监听的表格id
 * @param func - 监听函数,第一个参数为当前鼠标悬停的tr对象,
 * 						第二个参数是当前行的索引从0开始
 * @return 返回tableid的对象
 */
function tableRowMouseOverListener(tableid, func) {
	var table = getByid(tableid);
	if (table==null) return;
	
	var rows = table.rows;
	for (var i=0; i<rows.length; ++i) {
		(function () {
			var funcstr = func;
			var row = rows[i];
			var rowindex = i;
			
			row.ondblclick = function () {
				funcstr(row, rowindex);
			}
		})();
	}
	
	return table;
}

/**
 * 当鼠标悬停在obj标记上时，颜色变为color<br>
 * 此时如要改变背景色需使用obj.setBackColor('#xxxxxx')设置背景色<br>
 * 
 * @param obj - html标记对象
 * @param color - 有效的css颜色值
 */
function onMouseOverChangeColor(obj, color) {
	var oldcolor = getColorInt(obj.style.backgroundColor);
	var ncolor = getColorInt(color);
	
	obj.setBackColor = function(newcolor) {
		var old = oldcolor;
		oldcolor = getColorInt(newcolor);
		return old;
	}
	
	obj.onmouseover = function() {
		if (oldcolor) {
			transitionColor(obj, oldcolor, ncolor);
		} else {
			changeColor(obj, ncolor);
		}
	}
	
	obj.onmouseout = function() {
		if (oldcolor) {
			transitionColor(obj, ncolor, oldcolor);
		} else {
			changeColor(obj, oldcolor);
		}
	}
	
	onremove(obj);
}

/**
 * obj的背景颜色由scolor变为ecolor, 颜色值为整数或css颜色字符串 
 */
function transitionColor(obj, scolor, ecolor, waitTime) {
	var count = 15;
	scolor = getColorInt(scolor);
	ecolor = getColorInt(ecolor);
	
	var er = ecolor >>> 16;
	var eg =(ecolor & 0x00ff00) >>> 8;
	var eb =(ecolor & 0x0000ff);
	
	var sr = scolor >>> 16;
	var sg =(scolor & 0x00ff00) >>> 8;
	var sb =(scolor & 0x0000ff);
	
	var rstep = (er-sr)/count;
	var gstep = (eg-sg)/count;
	var bstep = (eb-sb)/count;
	
	var cc = 0;
	var i = 0;
	
	if (!waitTime) waitTime = 20;
	
	obj.transcol = function() {
		if ( i<count ) {
			sr += rstep;
			sg += gstep;
			sb += bstep;
			cc = (sr<<16) | (sg<<8) | (sb);
			changeColor(obj, cc);
			
			if (obj.transcol) {
				setTimeout(obj.transcol, waitTime);
			}
			i++;
		}
	}
	obj.transcol();
}

/**
 * 线程锁对象，在obj对象上添加锁
 */
function LockObj(obj) {
	var lockname = "jym_jsx_thread_lock_object";
	
	if ( !obj[lockname] ) {
		obj[lockname] = 0;
	}
	
	/**
	 * 在对象上加锁，如果对象已经被其他线程锁定，
	 * 则需要等待，锁被释放才能继续执行
	 *
	 * @parm func - 锁被释放后，执行的方法
	 */
	this.lock = function(func) {
		if (typeof func==='function') {
			var waitlock = function() {
				if (obj[lockname]>0) {
					setTimeout(waitlock, 50);
				} else {
					obj[lockname]++;
					func();
				}
			}
			waitlock();
		}
	}
	
	/**
	 * 如果对象没有被锁定，执行func函数
	 * 否则忽略
	 */
	this.check = function(func) {
		if (typeof func==='function') {
			if (obj[lockname]==0) {
				obj[lockname]++;
				func();
			}
		}
	}
	
	/**
	 * 释放对象上的锁
	 */
	this.free = function() {
		obj[lockname]--;
		if ( obj[lockname]<0 ) obj[lockname]=0;
	}
}

/**
 * css颜色格式('#000000')转换为整数，并返回
 */
function getColorInt(csscolor) {
	if (typeof csscolor=="string") {
		
		if (csscolor.indexOf("#")>=0) {
			return parseInt( csscolor.substr(1,csscolor.length),16 );
			
		} else {
			// firfox: 'rgb(r,g,b)'format
			var arr = csscolor.split(","); 
			var r = parseInt( arr[0].substring(4) ); 
			var g = parseInt( arr[1] ); 
			var b = parseInt( arr[2].substring(0,arr[2].length-1) );
			
			return r * 256 * 256 + g * 256 + b;
		}
	} else {
		return csscolor; //0xffffff;
	}
}

/**
 * 修改obj的颜色为color
 * 
 * @param obj - html标记对象
 * @param color - 有效的css颜色值, 如果color为整数自动格式化为css格式
 *					如果color===false, 则对象变为透明背景
 */
function changeColor(obj, color) {
	if (!color) {
		obj.style.backgroundColor = '';
	}
	else if (isNaN(color)) {
		obj.style.backgroundColor = color
	} else {
		obj.style.backgroundColor = int2color(color);
	}
}

function int2color(i) {
	i = parseInt(i);
	if (i<0) i=0;
	if (i>0xffffff) i=0xffffff;
	
	var c = new Number(i).toString(16);
	var zlen = 6 - c.length;
	for (var i=0; i<zlen; ++i) {
		c = '0' + c;
	}
	return '#' + c;
}

/**
 * 对div标签的封装类，让divid指定的div可以被鼠标拖动
 * @author CatfoOD 2009
 * 
 * @param divid - 目标divid
 * @param touchid - 触发鼠标事件的对象的id,如果为null,则div不可用鼠标拖动
 * 					如果touchid不为null并且指定的对象无效，
 * 					则使用div自己触发鼠标拖动事件
 */
function DivPack(divid, touchid) {
	var div = document.getElementById(divid);
	if (div==null) div = divid;

	var x = 0;
	var y = 0;
	var stop = true;
	var mx = 0;
	var my = 0;
	var ins = this;
	
	this.setX = function(nx) {
		x = nx;
		setX(div, x);
	}
	
	this.setY = function(ny) {
		y = ny;
		setY(div, y);
	}
	
	this.getX = function() {
		return x;
	}
	
	this.getY = function() {
		return y;
	}
	
	this.getDiv = function() {
		return div;
	}
	
	var divmove = function() {
		stop = false;
		mx = event.screenX;
		my = event.screenY;
	}

	var cancelmove = function() {
		stop = true;
	}

	var mousemove = function () {
		if (stop) return;
		
		var offx = event.screenX;
		var offy = event.screenY;
		
		ins.setX( ins.getX()+offx-mx );
		ins.setY( ins.getY()+offy-my );

		mx = offx;
		my = offy;
	}
	
	if (touchid) {
		var toucher = document.getElementById(touchid);
		if (toucher==null) {
			toucher = div;
		}
		toucher.onmousedown = divmove;
		toucher.onmouseup = cancelmove;
		
		var old_handle = document.onmousemove;
		if (!old_handle) old_handle = function(){};
		
		document.onmousemove = function() {
			mousemove();
			old_handle();
		}
		
		div.style.position = "absolute";
	}
}

function setX(obj, x) {
	obj.style.pixelLeft = x;
}

function setY(obj, y) {
	obj.style.pixelTop = y;
}

function getTop(obj) {
	var parent = obj;
	var p_offset = 0;
	while(parent) {
		p_offset += parent.offsetTop;
		parent = parent.parentElement;
	}
	return p_offset;
}

/**
 * 移动obj对象,从startx到finishx, 移动完成后调用after()
 */
function movex(obj, startx, finishx, after) {
	anim(function(v) {
		setX(obj, v);
	}, startx, finishx, 300, after);
}

function movey(obj, starty, finishy, after) {
	anim(function(v) {
		setY(obj, v);
	}, starty, finishy, 300, after);
}

function isie() {
	var name = 'jym.jsx.iename.cache';
	if (window[name]===undefined) {
		window[name] = navigator.appName.search('Microsoft')>=0;
	}
	return window[name];
}

function isopera() {
	var name = 'jym.jsx.isopera.cache';
	if (window[name]===undefined) {
		window[name] = navigator.appName.indexOf('Opera')>=0;
	}
	return window[name];
}

function isff() {
	var name = 'jym.jsx.isfirefox.cache';
	if (window[name]===undefined) {
		window[name] = navigator.userAgent.indexOf('Firefox')>=0;
	}
	return window[name];
}

/**
 * 设置obj的透明度为opa(0-100)
 */
function setOpacity(obj, opa) {
	if (isie()) {
		obj.style.filter = 'alpha(opacity='+opa+');';
	} else {
		obj.style.opacity = opa/100;
	}
}

/**
 * 抛物线函数,x1-起始,x2-结束,y-get()返回的最大值
 */
function Parabola(x1, x2, y) {
	var w, p, my, sx;
	
	if (x1<x2) {
		w = Math.abs( (x2-x1)/2 );
		sx = x1;
	} else {
		w = Math.abs( (x1-x2)/2 );
		sx = x2;
	}
	my = y;
	p = (w*w) / -my;
	
	/**
	 * x1<x<x2
	 */
	this.get = function(x) {
		x = x-sx-w;
		return x*x / p+my;
	}
}

/**
 * func - 动画函数格式: func(frame);
 *		frame - 从start~end之间的数值
 * start - 起始值
 * end - 结束值
 * millise - 耗费的时间
 * after - 动画执行结束回叫函数
 * <br>
 * 在millise时间中以每秒24帧的速度执行动画func(a),
 * a的值从start,到end, 如果func速度太慢会跳帧
 * <br>
 * <b>该函数使用曲线过渡使动画更平滑</b>
 */
function conic(func, start, end, millise, after) {
	var base = Math.min(start, end);
	var len = Math.max(start, end) - base;
	var para;
	var filter;

	if (start<end) {
		para = new Parabola(start, end+len, len);
		
		filter = function(n) {
			return func( base+para.get(n) );
		}
	} else {
		para = new Parabola(start+len, end, len);

		var a = base+start;
		var b = base+len;
		filter = function(n) {
			return func( b-para.get( a-n ) );
		}
	}

	anim(filter, start, end, millise, after);
}

/**
 * func - 动画函数格式: func(frame);
 *		frame - 从start~end之间的数值
 *		如果func返回'stop'则动画函数终止并返回, after方法不会回调
 * start - 起始值
 * end - 结束值
 * millise - 耗费的时间
 * after - 动画执行结束回叫函数
 *
 * 在millise时间中以每秒24帧的速度执行动画func(a),
 * a的值从start,到end, 如果func速度太慢会跳帧
 * <br>
 * <b>动画效果是线性的, 没有过渡效果</b>
 */
function anim(func, start, end, millise, after) {
	var oftime = 24;
	var _1sec = 1000;
	var oframe = _1sec / oftime;
	var size = ( Math.max(start, end) - Math.min(start, end) );
	var step = size / oftime / (millise / _1sec);
	var f = start<end ? 1 : -1;
	var STOP = 'stop';
	
	var milliseconds = function () {
		return new Date().getTime();
	}
	
	var stime = milliseconds();
	var utime = -1;
	
	var th = function() {
		if (utime<0) {
			utime = oframe;
		} else {
			utime = milliseconds() - utime;
		}
		
		if ( f*start < f*end ) {
			start += ((step * utime/oframe)*f);
			
			utime = milliseconds();
			if (func(start)==STOP) return;
			setTimeout(th, 1);
		} else {
			if (func(end)==STOP) return;
			
			if (typeof after=='function') {
				after();
			}
		}
	};
	th();
}

/**
 * 为target对象添加右键菜单
 * menu对象是菜单
 */
function setMenu(menu, target) {
	if (!target) {
		target = document.body;
	}
	
	menu.style.position = 'absolute';
	menu.style.display = 'none';
	
	target.oncontextmenu = function() {
		menu.style.pixelLeft = event.clientX + target.scrollLeft;
		menu.style.pixelTop  = event.clientY + target.scrollTop;	
		menu.style.display   = 'block';
		
		anim(function(p) {
			setOpacity(menu, p);
		}, 0, 80, 300);
		
		var hide = function() {
			anim(function(p) {
				setOpacity(menu, p);
			}, 80, 0, 500, function() {
				menu.style.display = 'none';
			});
		}
		
		menu.onclick  = function() {
			hide();
		}
		
		target.onclick = function() {
			hide();
		}
		
		return false;
	}
}

/** 显示对话框 */
function Dialog(width, height) {
	var obj = document.body;
	var ox = obj.offsetLeft;
	var oy = obj.offsetTop;
	var ow = obj.clientWidth;
	var oh = obj.clientHeight;
	var oldresizehandle = false;
	
	var hide = createDiv(ow, oh, '#555', 50);
	var div = createDiv(width, height);
	
	var selects = new selector('select');
	
	var resizeHid = function() {
		hide.style.height = hide.style.width = '0px';
		var bw = document.body.clientWidth;
		var bh = document.body.clientHeight;
		var sw = document.body.scrollWidth;
		var sh = document.body.scrollHeight;
		hide.style.width 	= (bw>sw)? bw: sw + 'px';
		hide.style.height	= (bh>sh)? bh: sh + 'px';
	}
	
	/** 显示对话框 */
	this.show = function(showready) {
		hide.style.display = "block";
		oldresizehandle = window.onresize;
		window.onresize = resizeHid;
		resizeHid();
		showDiv(div, showready);
		
		selects.todo(function (s) {
			this.old_visibility = s.style.visibility; 
			s.style.visibility = "hidden";
		});
	}
	
	/** 关闭对话框 */
	this.close = function() {
		hide.style.display = "none";
		hideDiv(div);
		window.onresize = oldresizehandle;
		
		selects.todo(function (s) {
			s.style.visibility = this.old_visibility;
		});
	}
	
	/** 设置内容为html */
	this.setHtml = function(html) {
		div.innerHTML = html;
		// 自动调整大小
		var bodyh = document.body.clientHeight;
		
		var y = getCenterY(div);
		var h = div.scrollHeight;
		
		div.style.top = y<0? 0 : y;
		div.style.height = h<bodyh ? h : bodyh;
	}
	
	this.getContentDiv = function() {
		return div;
	}
	
	function getCenterY(_tar) {
		var bodyh = document.body.clientHeight;
		return ( bodyh - _tar.scrollHeight ) / 2 - 20;
	}
	
	function createDiv(wid, hei, color, opacity) {
		var w = wid;
		var h = hei;
		var x = (ow-w)/2 + ox;
		var y = (oh-h)/2 + oy;

		if (!color) color = '#ffffff';
		var ediv = document.createElement("div");
		ediv.style.backgroundColor = color;
		ediv.style.position 	= "absolute";
		ediv.style.left 		= x + 'px';
		ediv.style.top 			= y + 'px';
		ediv.style.width 		= w + 'px';
		ediv.style.padding		= 15;
		ediv.style.display		= "none";
		insertDom(document.body, ediv);
		
		if (!isie()) {
			ediv.style.overflow 	= 'hidden';
			
			ediv.onclick = function() {
				ediv.style.height = '0px';
				ediv.style.height = ediv.scrollHeight + 'px';
				resizeHid();
			}
		} else {
			ediv.onclick = function() {
				resizeHid();
			}
		}

		if (opacity) setOpacity(ediv, opacity);
		
		return ediv;
	}
}

/**
 * 为对象的事件提供链式调用, 防止新的事件覆盖老的事件处理函数
 * 新的事件处理优先于老的事件处理
 * @param {} obj - 标签对象
 * @param {} eventName - 事件名
 * @param {} newEvent - 新的事件处理函数
 */ 
function eventStack(obj, eventName, newEvent) {
	if (typeof newEvent!='function') return;
	
	var oldEvent = obj[eventName];
	
	if (oldEvent) {
		obj[eventName] = function() {
			newEvent();
			oldEvent();
		}
	} else {
		obj[eventName] = newEvent;
	}
}