==== [工作环境] =================================================================
postgresql 8.2
Eclipse 3.5

==== [rdf/xml样例] ==============================================================

<?xml version="1.0"?>

<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
		xmlns:my_define="http://自定义属性类型的名字空间/可以是有意义的URI">

	<rdf:Description rdf:about="http://www.example.org/index.html">
		<my_define:Person rdf:about="http://www.w3.org/People/EM/contact#me">
			<my_define:fullName>Eric Miller</my_define:fullName>
			<my_define:mailbox rdf:resource="mailto:em@w3.org"/>
			<my_define:personalTitle ref:datatype='xxx'>Dr.</my_define:personalTitle> 
		</my_define:Person>
	</ref:Description>
	
</rdf:RDF>


==== [在这里描述的都是如何把数据库结构表现为RDF结构] ===============================


xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	-- rdf的命名空间, 固定的
	
rdf:Description
	-- 每一个元素是数据库中的一行数据，所以当查询某个rdf资源时必须加条件以限制数据
		的数量

rdf:about
	-- 在rdf:Description -- 表示该行数据的URI, 该URI可以是该行数据的某一个字段的值,
		也可以是能查询到该数据的某个页面(比如http://xxx/getName.do?name=abc&id=123 
		就能查询到一个 html页面该页面有该rdf表示的数据)
		该属性的意义便是RDF要实现的资源之间的互相引用，即语义网的基础，但是这个数
		据的来源仍然需要保存在本地数据库中，如果本地数据库没有该字段，则引用本地
		WEB实现中的HTML页面
		
	-- 在自定义名字空间中 -- 可以省略rdf:Description的定义? 通常没有, 没弄明白
	
rdf:resource
	-- 该属性的值是另一个资源, 外键使用这个属性, 该值指向一个有效的rdf资源(通常是另一
		个表的RDF)
	
ref:datatype
	-- 暂时省略该属性,  通常是数据库中该列的数据类型(把它转化为XML Schema中的类型)
	
	
==== [URL的定义] =================================================================

http://localhost/rdf
	-- 基础地址, 用游览器请求该地址能打开一个索引页
	
! /ns/[table_name]/
	-- 该表的命名空间, 返回一个用来表述该表格的RDF (没实现)
	
/data/[table_name]/?[params]
	-- 查询该表的数据, params是参数, 直接使用表格列名+值来限制查询结果

/data/default/?key=xxx&id=yyy
	-- 默认的rdf查询


==== [当前的问题] ================================================================

http://zh.transwiki.org/cn/rdfprimer.htm - 主要参考文档

1. 元素值没有定义具体的数据类型, rdf:datatype属性
2. 当前数据库的结构只能支持到量个子节点
3. name space 引用的应该是一个RDF Schema [http://dublincore.org/documents/dcmi-terms/]
	指向哪里? 应该是 [http://purl.org/dc/elements/1.1/] ?


==== [src目录说明] ===============================================================

wsl.rdf.conf		各种配置文件
wsl.rdf.process		服务器控制层相当于Servlet的实现类
wsl.rdf.struct		存放于数据有关类
wsl.rdf.test		测试类
wsl.rdf.core		rdf的基础架构		

