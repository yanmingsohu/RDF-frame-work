// CatfoOD 2011-7-27 下午02:48:13 yanming-sohu@sohu.com/@qq.com

package wsl.rdf.dao.impl;

import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import jym.sim.sql.ISql;
import wsl.rdf.dao.DaoBase;


public class DefaultDao extends DaoBase {

	public final static String ITEM_ROOT = "rdf:Description";
	public final static String ABOUT_ATT = "rdf:about";
	public final static String ABOUT_URI = "rdf/data/default/?id=";

	
	public Collection<EntryItem> search(final RequestBean model) {
		final Map<Integer, EntryItem> grps = new HashMap<Integer, EntryItem>();
		
		jdbc().query(new ISql() {
			public void exe(Statement stm) throws Throwable {

				ResultSet rs = stm.executeQuery( getSql(model) );
			
				while (rs.next()) {
					int item_id = rs.getInt(1);
					EntryItem grp = grps.get( item_id );
					
					if (grp==null) {
						grp = new EntryItem();
						grps.put(item_id, grp);
						
						grp.setAttribute(ABOUT_ATT, ABOUT_URI + item_id);
					}
					
					String shortId = rs.getString(6);
					
					grp.pushValue(	rs.getString(2),
									ITEM_ROOT,
									getTagName(shortId, rs.getString(3)), 
									getTagName(shortId, rs.getString(4)) );
					
					model.pushNameSpace(rs.getString(5), shortId);
				}
			}
		});
		
		return grps.values();
	}
	
	private String getTagName(String ns, String tag) {
		if (tag==null) return null;
		if (ns==null) {
			return tag;
		} else {
			return ns + ":" + tag;
		}
	}
	
	/** 取得的sql只查询前10条数据 */
	private String getSql(RequestBean model) {
		return 
			" SELECT " +
			"	item_id, " 		+ // 1
			"	text_value, "	+ // 2
			"	element,"		+ // 3
			"	qualifier, "	+ // 4
			"	namespace, "	+ // 5
			"	short_id, "		+ // 6
			"	scope_note "	+ // 7
			
			" FROM metadatavalue mdv " +
			" left join metadatafieldregistry mdfr " +
			"   on mdv.metadata_field_id = mdfr.metadata_field_id " +
			" left join metadataschemaregistry mdsr " +
			"   on mdsr.metadata_schema_id = mdfr.metadata_schema_id " +
		(model.getId()!=null ? (
			" where item_id = " + model.getId()
		) : (
			" where item_id in ( " +
			"   select item_id from metadatavalue " +
			"   where text_value like '%" + model.getKey() + "%' " +
			"	group by item_id " +
			"	LIMIT 10 OFFSET 0 " +
			" )"
		));
	}
}
