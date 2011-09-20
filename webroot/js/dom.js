// CatfoOD 2009.12.9
// charset: UTF-8
// v0.11

/**
 * 节点搜索器方法<br>
 * path使用'.'分割,如x.y.z其中x y z可以是标签名字,class或id
 * 
 * @param element - html对象
 * @param path - 路径字符串,用'.'分割
 * @return 返回所有符合path的元素数组
 */
function node(element, path) {
	var keys = path.toLowerCase().split('.');
	
	var filter = function(elem ,key) {
		var child = new Array();

		for (var j=0; j<elem.length; ++j) {
			var e = elem[j];
			if (	( e.id && key == e.id.toLowerCase() )
			    ||	( e.className && key == e.className.toLowerCase() )
				||	( e.tagName && key == e.tagName.toLowerCase() )
				) 
			{
			child.push(elem[j]);
			}
		}
		return child;
	}
	
	var copy = function(to, src) {
		for (var i=src.length-1; i>=0; --i) {
			to.push( src[i] );
		}
	}

	var childs = new Array();
	var cns = new Array();
	copy(cns, element.childNodes);
	
	for (var i=0; i<keys.length; ++i) {
		childs.length = 0;
		childs = filter(cns, keys[i]);
		cns.length = 0;
		
		for (var j=childs.length-1; j>=0; --j) {
			copy(cns, childs[j].childNodes);
		}
	}
	
	return childs;
}


function Dom(xml) {
	
	var getElement = function(nodename, parent) {
		var nodes = getElements(nodename, parent);
		var node = null;
		if (nodes && nodes.length>0) {
			node = nodes[0];
		}
		return node;
	}
	
	var getElements = function(nodename, parent) {
		var nodes = parent.getElementsByTagName(nodename);
		return nodes;
	}
	
	/**
	 * 沿路径取得节点
	 * 路径使用'.'分割，如果不存在返回null
	 */
	this.getNode = function(path) {
		var elems = path.split('.');
		var node = xml;
		
		for (var i=0; i<elems.length; ++i) {
			node = getElement(elems[i], node);
			if (node==null) break;
		}
		return node;
	}
	
	/**
	 * 沿路径取得节点的值，值的来源可以是属性值或文本节点值
	 * 路径使用'.'分割，如果不存在返回null
	 */
	this.getValue = function(path) {
		var node = this.getNode(path);
		var value = null;
		if (node) {
			value = node.firstChild.data;
		}
		return value;
	}
}

/**
 * 创建dom文档的便捷方法,为了便于引用对象,深层次的[引用名]如果没有重复,可以直接引用node_arr.tags[深层次没有重复的名字]<br>
 * 另外,返回的数据加入obj属性,该属性引用创建出的标签对象<br>
 * <b>注意:</b> class 属性需要使用引号,或使用clazz属性代替<br>
 * 导出release()方法,提供释放内存的方法,在任意对象上调用release会引起整个dom树的释放<br>
 * <br>
 * node_arr的格式:<br><pre>
 * {
 * 	parent:[作为所有标签的父标签]	// 只有最外层允许有这个属性
 * 	[标签1的引用名字]:{				// 方法返回后可以使用 node_arr.tags.[标签1的名字] 来引用
 * 	 	tag:"[标签名]",				// 必须是合法的html标签名
 * 	 	attr: {[属性列表]},			// 可以是任意属性,注意class需要使用引号,否则与关键字冲突
 * 		text: "[标签内的文字]"		// 标签内的文字
 * 		event: {
 * 			[事件名]:function(){}	// 绑定事件
 * 		}
 * 	 	sub: {						// 子标签的定义,语法与[标签1]的定义方法相同
 * 	 		[子标签1],[子标签n...]	// 可以有任意子标签,子标签的引用方法 node_arr.tags.[标签1的名字].[子标签的名字]
 * 	 	}							// 子标签也可以有子标签
 * 	},
 * 	[标签2...]						// 标签的生成方法依照这个顺序
 * }
 * </pre>
 * 
 * @param {} node_arr - 创建dom文档需要的数据
 * XXX 内存泄露
 */
function dom_builder(node_arr) {
	 
	var parentNode = node_arr['parent'];
	if (!(parentNode && parentNode.tagName)) 
		throw new Error("not found 'parent' attribute. or not html tag.");
	
	node_arr.parent = null;
	node_arr.tags = {};
	
	
	function format_name(_name) {
		if (_name=='float') return 'styleFloat';
		
		if (_name.indexOf('-')) {
			var len = _name.length;
			var is = false;
			var result = [];
			
			for (var i=0; i<len; ++i) {
				var c = _name.charAt(i);
				if (c=='-') {
					is = true;
					continue;
				}
				if (is) {
					is = false;
					result.push(c.toUpperCase());
					continue;
				}
				result.push(c);
			}
			return result.join('');
		}
		
		return _name;
	}
	
	function set_style(_tag, _styles) {
		_styles = _styles.replace(/\s/g, '');
		var pairs = _styles.split(';');
		
		for (var i=pairs.length-1; i>=0; i--) {
			var pair = pairs[i].split(':');
			
			if (pair.length>1) {
				_tag.style[ format_name(pair[0]) ] = pair[1];
			}
		}
	}
	
	function banding_event(_tag, _events) {
		
		for (var name in _events) {
			var handle = _events[name];
			
			if (typeof handle == 'function') {
				if (_tag.attachEvent) {
					_tag.attachEvent(name, handle);
				}
				else if (_tag.addEventListener) {
					//addEventListener的第一个参数不带'on'
					if (name.indexOf('on')==0) {
						name = name.substr(2);
					}
					_tag.addEventListener(name, handle, false);
				}
				else {
					_tag[name] = handle;
				}
			}
		}
	}

	function create_sub(_parentNode, node_data, tag_ref) {
		
		for (var tagRefName in node_data) {
			if (tagRefName=='tags') continue;
			
			var tagData = node_data[tagRefName];
			if (!tagData) continue;
			
			var tag = document.createElement(tagData['tag']);
			_parentNode.appendChild(tag);
			if (!tag) {
				showError(tagRefName+"定义的标签名:"+tagData['tag']+"无效");
				continue;
			}

			tag_ref[tagRefName] = tag;
			tagData['obj'] = tag;
			
			if (node_data!=node_arr && !node_arr.tags[tagRefName]) {
				node_arr.tags[tagRefName] = tag;
			}
			
			var attrs = tagData['attr'];
			if (typeof attrs=='object') {
				for (var attrName in attrs) {
					if (attrName=='style') {
						set_style(tag, attrs[attrName]);
					}
					if (attrName=='clazz') attrName='class';
					tag.setAttribute(attrName, attrs[attrName]);
				}
			}
			
			var text = tagData['text'];
			if (text) {
				tag.innerHTML = text;
			}
			
			var events = tagData['event'];
			if (typeof events=='object') {
				banding_event(tag, events);
			}
			
			var subs_node_data = tagData['sub'];
			if (typeof subs_node_data=='object') {
				create_sub(tag, subs_node_data, tag_ref[tagRefName]);
			}
				
			var _release = function() { 
				tag.release = null; 
				node_data.release = null;
				
				removeAllCrossLink(tag);
				
				if (_parentNode.release) {
					_parentNode.release();
					_parentNode = null;
				}
				
				for (var _sub in subs_node_data) {
					if (subs_node_data && subs_node_data.release) {
						subs_node_data.release();
						subs_node_data = null;
					}
				}
				tagData['obj'] = null;
				node_data.parent = node_data.tags = null;
				node_arr = null;
			}
		}
		
		tag.release = _release;
		node_data.release = _release;
	}
	
	create_sub(parentNode, node_arr, node_arr.tags);
	
	return node_arr;
}