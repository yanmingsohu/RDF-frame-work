(function () {
	
/** 
 * 过滤选择器,首先从全部tag中取出名字tagName的tag
 * 进而可以用其他方法筛选出需要的tag
 */
var selector = function(tags_) {
	if (tags_) {
		if (typeof tags_=="string"){
			this.ts = document.getElementsByTagName(tags_);
		} else {
			this.ts = tags_
		}
	} else {
		this.ts = document.getElementsByTagName('*');
	}
}

selector.prototype = {
		
	// 筛选出指定name的tag
	"tagname" : function(tagname_) {
		return this.filter_tag(function(tag) {
			return (tag.tagName && tag.tagName.toLowerCase()==tagname_);
		});
	},
	
	"name" : function(name_) {
		return this.filter_tag(function(tag) {
			return (tag.name && tag.name.toLowerCase()==name_);
		});
	},
		
	// 筛选出指定className的tag,
	"clazz" : function(className_) {
		return this.filter_tag(function(tag) {
			return (tag.className && (tag.className.toLowerCase()==className_));
		});
	},
	
	// 筛选出指定id的tag
	"id" : function(id_) {
		return this.filter_tag(function(tag) {
			return (tag.id && tag.id.toLowerCase()==id_);
		});
	},
	
	// 筛选出属性为attrName,并且值是value的标记
	"attr" : function(attrName, value) {
		return this.filter_tag(function(tag) {
			var v = tag.getAttribute(attrName);
			return (v && v==value);
		});
	},
	
	// 筛选出有指定属性的tag
	"hasattr": function(attrName) {
		return this.filter_tag(function(tag) {
			// 如果修改为!== 会引起兼容问题
			return tag.getAttribute(attrName)!=undefined;
		});
	},
	
	// 在标签中搜索子节点
	"node" : function(path) {
		var newTags = new Array();
		this.todo(function(tag_){
			var fi = node(tag_, path);
			var size = fi.length;
			for (var i=0; i<size; ++i) {
				newTags.push(fi[i]);
			}
		});
		return this.r(newTags);
	},
	
	// 在筛选出的tags上执行handle_方法, function handle(tag) {...}
	"todo" : function(handle_) {
	//	alert(this.ts.length);
		var size = this.ts.length;
		var obj_arr = this.ts;
		
		for (var i=0; i<size; ++i) {
			handle_(obj_arr[i]);
		}
		return this;
	},
	
	// 返回当前选择器下的全部对象
	"getTags" : function() {
		return this.ts;
	},
	
	"size" : function() {
		return this.ts.length;
	},
	
	// ----------------------------------------------- 内部调用
	
	// 返回包含newtags_的新的selector对象
	"r" : function(newtags_) {
		if (!newtags_) {
			newtags_ = this.ts;
		}
		return new selector(newtags_);
	},
	
	// 循环所有标签,如果filter返回true,则加入被选标签组,并返回它
	"filter_tag" : function(filter_) {
		var newtags = new Array();

		this.todo(function (tag) {
			if (filter_(tag)==true) {
				newtags.push(tag);
			}
		});
		return this.r(newtags);
	}
};

window.selector = selector;

})();