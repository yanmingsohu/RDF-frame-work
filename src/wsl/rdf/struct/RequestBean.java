// CatfoOD 2011-7-27 下午09:28:52

package wsl.rdf.struct;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;


/**
 * 请求参数, 并负责传送回调的name space
 */
public class RequestBean {

	private Map<String, String>	nameSpace;
	
	private String	key;
	private Integer	id;
	private String	aboutBase;
	
	
	public RequestBean() {
		nameSpace = new HashMap<String, String>();
	}
	
	public String getNameSpaceDefine() {
		StringBuilder buf = new StringBuilder();
		
		Iterator<String> itr = nameSpace.keySet().iterator();
		
		while (itr.hasNext()) {
			String ref = itr.next();
			String url = nameSpace.get(ref);
			
			buf.append("\n\txmlns:");
			buf.append(ref);
			buf.append("=\"");
			buf.append(url);
			buf.append("\"");
		}
		
		return buf.toString();
	}
	
	public Map<String, String> getNameSpace() {
		return nameSpace;
	}

	public void pushNameSpace(String url, String ref) {
		nameSpace.put(ref, url);
	}
	
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
	}
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public void setId(String id) {
		try {
			this.id = new Integer(id);
		} catch(Exception e) {}
	}
	public String getAboutBase() {
		return aboutBase;
	}
	public void setAboutBase(String aboutBase) {
		this.aboutBase = aboutBase;
	}
}
