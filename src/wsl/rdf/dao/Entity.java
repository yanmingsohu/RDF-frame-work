// CatfoOD 2011-7-27 下午03:39:21 yanming-sohu@sohu.com/@qq.com

package wsl.rdf.dao;

import java.lang.reflect.Field;

import jym.sim.util.Tools;


public abstract class Entity {

	public String toString() {
		StringBuilder out = new StringBuilder();
		
		Class<?> c = getClass();
		out.append(c).append(": {\n");
		
		while (c!=null) {
			Field[] fs = c.getDeclaredFields();
			
			
			for (int i=0; i<fs.length; ++i) {
				try {
					fs[i].setAccessible(true);
					Object v = fs[i].get(this);
					
					if (v instanceof Entity) continue;
				
					out.append("\t")
						.append(fs[i].getName())
						.append("\t: ")
						.append(v)
						//.append("\t - ").append(fs[i])
						.append("\n");
					
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
			
			c = c.getSuperclass();
			
			if (c!=null) {
				out.append("<Ext: ").append(c).append(">\n");
			}
		}
		
		out.append("<Prt: ").append(Tools.source(2)).append(">\n");
		out.append("}\n");
		return out.toString();
	}
	
}
