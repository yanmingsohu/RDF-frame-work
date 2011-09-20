// CatfoOD 2009.11.25
// 依赖common.js
// charset: UTF-8
// v0.32

/**
 * 复用该对象效率更高<br>
 * 调用顺序: 
 * 		1. setXxxListener() 
 * 		2. open()/get()/post() 
 * 		3. send()
 * 		4. 重复 3.
 */
function ajax() {

	var m_method = "GET";
	var m_url = false;
	var m_async = false;
	var m_headles = new Array();
	var xmlreq = null;

	
	// 释放内存,防止内存泄漏,必须在请求结束后调用
	var free = function() {
		xmlreq.onreadystatechange = function() {};
		xmlreq = null;
	}
	
	var eventheadle = function() {
		for (var i=0; i<m_headles.length; ++i) {
			m_headles[i]();
		}
	}
	
	// 在上传的数据中增加charset字段为utf-8,以便服务端编码
	var initheader = function() {
		xmlreq.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		xmlreq.setRequestHeader('cache-control', 'no-cache');
		xmlreq.setRequestHeader('charset', 'utf8');
	}
	
	// 修正火狐不能正确响应readyState == 4的情况
	var __state = 1;
	var fix_firefox_ajax = function() {
		if (__state < xmlreq.readyState) {
			eventheadle();
			__state = xmlreq.readyState;
		}
		if (__state < 4) {
			setTimeout(fix_firefox_ajax, 100);
		}
	}
	
	var initHttpRequest = function() {
		if (xmlreq)	free();
		__state = 1;
		
		xmlreq = creatHttpRequest();
		if (!xmlreq) {
			showError("ajax.init: create request error!");
		}
		else {
			xmlreq.onreadystatechange = eventheadle;
		}
		
		if (m_url) {
		/* 使用另一种方法在FF中同步执行ajax
			if (isff()) {
				m_async = false;
			} */
			xmlreq.open(m_method, m_url, m_async);
			initheader();
		} else {
			showError("ajax.init: url fail!");
		}
	}
	
	/**
	 * 打开请求
	 */
	this.open = function(url) {
		if (url) {
			m_url = url;
		}
	}
	
	/**
	 * 用post打开请求的url
	 */
	this.post = function(url) {
		this.setMethod("POST");
		this.open(url);
	}
	
	/**
	 * 用get打开请求的url
	 */
	this.get = function(url) {
		this.setMethod("GET");
		this.open(url);
	}
	
	/**
	 * 发送请求
	 */
	this.send = function(content) {
		initHttpRequest();
		if (!content) content = null;
		xmlreq.send(content);
		
		if ((!m_async) && isff()) {
			fix_firefox_ajax();
		}
	}
	
	/**
	 * 中断请求
	 */
	this.abort = function() {
		xmlreq.abort();
	}
	
	/**
	 * 设置请求的方法，post;get;...
	 */
	this.setMethod = function(method) {
		m_method = method;
	}
	
	/**
	 * 设置为post方法，并更新上传的内容类型为form
	 */
	this.setPostMethod = function() {
		m_method = "POST";
	}
	
	this.setUrl = function(url) {
		m_url = url;
	}
	
	/**
	 * 是否设置为异步方式,(默认是同步)
	 */
	this.setAsync = function(syncFlag) {
		m_async = syncFlag;
	}
	
	this.setRequestHeader = function(name, value) {
		try {
			xmlreq.setRequestHeader(name, value);
		} catch(e) {
			showError( "ajax.setRequestHeader() after open()" );
		}
	}
	
	/**
	 * 添加事件修改处理句柄，句柄函数格式：
	 * headle(readyState, status, xmlobj);
	 *
	 * readyState - ajax状态码
	 * status - 返回的http状态码
	 * xmlobj - XMLHttpRequest对象
	 */
	this.setListener = function(headle) {
		m_headles.push( function() {
			headle( xmlreq.readyState, xmlreq.status, xmlreq );
		} );
	}
	
	/**
	 * 添加事件处理句柄，句柄函数格式：
	 * headle(xmlobj);
	 * 当readyState==4， status==200时被调用
	 *
	 * xmlobj - XMLHttpRequest对象
	 */
	this.setOkListener = function(headle) {
		m_headles.push( function() {
			if ( xmlreq.readyState==4 &&
					(xmlreq.status==200 || xmlreq.status==0) ) {
				headle(xmlreq);
			}
		} );
	}
	
	/**
	 * 添加文本接收句柄，句柄格式：
	 * headle(text);
	 * 
	 * text - 应答返回的文本
	 */
	this.setTextListener = function(headle) {
		this.setOkListener( function(_xmlreq) {
			headle(_xmlreq.responseText);
		} );
	}
	
	/**
	 * 添加xml接收句柄，句柄格式：
	 * headle(xml);
	 * 
	 * xml - 应答返回的xml对象
	 */
	this.setXmlListener = function(headle) {
		this.setOkListener( function(_xmlreq) {
			headle(_xmlreq.responseXML);
		} );
	}
	
	/**
	 * 添加json接收句柄，句柄格式：
	 * headle(json);
	 * 
	 * json - 应答返回的json对象
	 * json.error - 如果在解析js时出现异常,则json的error属性为true
	 * json.jtext - 接受的字符串在json的jtext属性中
	 */
	this.setJSonListener = function(headle) {
		this.setTextListener( function(text) {
			var json = false;
			try {
				json = eval( '(' + text + ')' );
			} catch (e) {
				json = new Array();
				json.error = true;
				json.jtext = text;
			}
			headle(json);
		} );
	}
	
	/**
	 * 添加错误处理句柄，句柄函数格式：
	 * headle(errmsg, status, xmlobj);
	 *
	 * errmsg - 错误的中文消息
	 * status - 返回的http状态码
	 * xmlobj - XMLHttpRequest对象
	 */
	this.setErrorListener = function(headle) {
		m_headles.push( function() {
			if ( xmlreq.readyState==4 &&
					(xmlreq.status!=200 && xmlreq.status!=0) ) {
				var errmsg = "未知错误";
				
				switch (xmlreq.status) {
					case 204: errmsg="无内容";
						break;
					case 400: errmsg="请求错误";
						break;
					case 403: errmsg="禁止访问";
						break;
					case 404: errmsg="文件未找到";
						break;
					case 408: errmsg="请求超时";
						break;
					case 500: errmsg="服务器错误";
						break;
					case 501: errmsg="未实现";
						break;
					case 505: errmsg="Http版本不支持";
						break;
				}
				headle( errmsg, xmlreq.status, xmlreq );
			}
		} );
	}
	
	/**
	 * 移除全部事件监听器
	 */
	this.clearListener = function() {
		m_headles = new Array();
	}
	
	// only read -------------------------------------------
	
	this.getAllResponseHeaders = function() {
		return xmlreq.getAllResponseHeaders();
	}
	
	this.getResponseHeader = function(name) {
		return xmlreq.getResponseHeader(name);
	}
	
	/**
	 * readyState:
	 * 0: 未初始化
	 * 1: 正在加载
	 * 2: 已加载
	 * 3: 交互
	 * 4: 完成
	 */
	this.getReadyState = function() {
		return xmlreq.readyState;
	}
	
	this.getBody = function() {
		return xmlreq.responseBody;
	}
	
	this.getStream = function() {
		return xmlreq.responseStream;
	}
	
	this.getText = function() {
		return xmlreq.responseText;
	}
	
	this.getXml = function() {
		return xmlreq.responseXML;
	}
	
	this.getStatus = function() {
		return xmlreq.Status;
	}
	
	this.getStatusText = function() {
		return xmlreq.statusText;
	}
}

/**
 * 封装一个form为不刷新递交表单
 * @param form - form对象,或form的id
 */
function ajaxform(form) {
	if (typeof form=='string') {
		form = getByid(form);
	}
	
	if (!form) throw "创建ajaxform参数[form]无效";
	
	var jx = new ajax();
	
	// 用来传递参数
	var handles = [];
	
	var send = function() {
		var formdata = getFormData(form);
		for (var name in handles) {
			var funcs = handles[name];
			for (var i in funcs) {
				var func = funcs[i];
				jx[name](func);
			}
		}
		jx.post(form.action);
		jx.send(formdata);
		jx = new ajax();
		return false;
	}
	
	form.onsubmit = send;
	this.send = send;
	
	// 从ajax继承的方法
	var funcNames = [
		'setTextListener', 'setXmlListener',
		'setJSonListener', 'setErrorListener'
	];
	
	var point = this;
	for(var i=funcNames.length-1; i>=0; i--) {
		(function() {
			var name = funcNames[i];
			point[name] = function(_h) {
				var funcs = handles[name];
				if (!funcs) {
					funcs = [];
					handles[name] = funcs;
				}
				funcs.push(_h);
			} 
		})(); 
	}
}