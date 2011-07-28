// CatfoOD 2011-7-27 下午03:33:25 yanming-sohu@sohu.com/@qq.com

package wsl.rdf.struct;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import wsl.rdf.core.EntityBase;


/**
 * 负责把压入的数据转换为xml文本(通过toString())
 */
public class EntryItem extends EntityBase {
	
	public final static String TAB_CHAR = "  ";
	
	private String	tag;
	private int		deep;

	private Map<String, EntryItem>	subtag;
	private Map<String, Object>		attributes;
	private List<String> 			text;
	
	
	public EntryItem() {
		subtag = new HashMap<String, EntryItem>();
		attributes = new HashMap<String, Object>();
		text = new ArrayList<String>();
	}
	
	/** 可以把某个字段转换为rdf:about的值,未实现 */
	public boolean isAbout() {
		return false;
	}
	
	public String getTag() {
		return tag;
	}

	public void setTag(String tag) {
		this.tag = tag;
	}

	private void addValue(Object value) {
		if (value==null) return;
		
		String text = String.valueOf(value);
		
		if (text.indexOf('<')>=0 
		 || text.indexOf('&')>=0
		 || text.indexOf('>')>=0 ) 
		{
			text = "<![CDATA[\n" + text + "\n]]>";
		}
		
		this.text.add(text);
	}

	public int getDeep() {
		return deep;
	}

	public void setDeep(int deep) {
		this.deep = deep;
	}
	
	public void setAttribute(String name, Object value) {
		attributes.put(name, value);
	}
	
//---------- input output --------------------------------------------------/>

	/**
	 * 向一个元素中压入数据, 如果元素不存在则创建
	 * subs[n+1] 是 subs[n] 的子元素
	 * 
	 * @param value - 压入当前元素或子元素的数据, 该值赋给最后一个subs元素
	 * @param subs - [0] 为当前元素的名字, 如果有名字空间则名字应该是:"ns:tagname"
	 */
	public void pushValue(Object value, String... subs) {
		
		if (subs!=null && subs.length>0 && subs[0]!=null) {
			tag = subs[0];
			
			if (subs.length>1 && subs[1]!=null) {
				
				String subName = subs[1];
				EntryItem sub = subtag.get(subName);
				
				if (sub==null) {
					sub = new EntryItem();
					sub.setDeep(getDeep()+1);
					subtag.put(subName, sub);
				}
				
				sub.pushValue(value, copyArr(subs));
			} else {
				addValue(value);
			}
		} else {
			throw new IllegalArgumentException("必须有三个以上参数");
		}
	}
	
	/** 
	 * 跳过src第一个元素
	 * java1.5 没有 Arrays.copyOfRange<br> 
	 */
	private String[] copyArr(String[] src) {
		String[] dsc = new String[src.length-1];
		for (int i=1; i<src.length; ++i) {
			dsc[i-1] = src[i];
		}
		return dsc;
	}
	
	protected void output(StringBuilder buf) {
		buf.append('\n');
		tab(buf, deep);
		buf.append('<').append(tag);
		writeAttribute(buf);
		buf.append('>');
		
		if (subtag.size()<1) {
			writeText(buf);
		} else {
			Iterator<EntryItem> itr = subtag.values().iterator();
			while (itr.hasNext()) {
				EntryItem sub = itr.next();
				sub.output(buf);
			}
		}
		
		buf.append('\n');
		tab(buf, deep);
		buf.append("</").append(tag).append('>');
	}
	
	private void writeText(StringBuilder buf) {
		buf.append('\n');
		tab(buf, deep+1);
		
		if (text.size()==1) {
			buf.append(text.get(0));
		} else {
			buf.append("<rdf:Bag>");
			
			Iterator<String> itr = text.iterator();
			while (itr.hasNext()) {
				buf.append('\n');
				tab(buf, deep+2);
				buf.append("<rdf:li>");
				buf.append(itr.next());
				buf.append("</rdf:li>");
			}
			
			buf.append('\n');
			tab(buf, deep+1);
			buf.append("</rdf:Bag>");
		}
	}
	
	private void writeAttribute(StringBuilder buf) {
		if (attributes.size()>0) {
			Iterator<String> keys = attributes.keySet().iterator();
			while (keys.hasNext()) {
				String key = keys.next();
				Object val = attributes.get(key);
				if (val!=null) {
					buf.append(' ');
					buf.append(key);
					buf.append("=\"");
					buf.append(val);
					buf.append('"');
				}
			}
		}
	}
	
	private void tab(StringBuilder buf, int deep) {
		for (int i=0; i<deep; ++i) {
			buf.append(TAB_CHAR);
		}
	}
	
	public String toString() {
		StringBuilder buf = new StringBuilder();
		output(buf);
		return buf.toString();
	}

}
