// CatfoOD 2011-7-27 下午01:03:10 yanming-sohu@sohu.com/@qq.com

package wsl.rdf.core;

import javax.sql.DataSource;

import jym.sim.pool.PoolFactory;
import jym.sim.sql.JdbcTemplate;
import jym.sim.util.Tools;


public abstract class DaoBase {
	
	public static final String DS_CONF = "/wsl/rdf/conf/datasource.conf";
	
	private static final Object lock = new Object();
	private static DataSource DS = null;
	
	private JdbcTemplate jdbc;
	

	private static void createDataSource() {
		synchronized (lock) {
			while (DS==null) {
				try {
					PoolFactory dp = new PoolFactory(DS_CONF, true);
					DS = dp.getDataSource();
				} catch (Exception e1) {
					Tools.pl("数据池初始化错误, " + e1);
				}
			}
		}
	}
	
	public DaoBase() {
		createDataSource();
		jdbc = new JdbcTemplate(DS);
	}
	
	/** 返回jdbc对象 */
	public JdbcTemplate jdbc() {
		return jdbc;
	}
}
