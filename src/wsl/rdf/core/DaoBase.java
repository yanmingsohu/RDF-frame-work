// CatfoOD 2011-7-27 下午01:03:10 yanming-sohu@sohu.com/@qq.com

package wsl.rdf.core;

import javax.sql.DataSource;

import jym.sim.pool.PoolFactory;
import jym.sim.sql.JdbcTemplate;
import jym.sim.util.Tools;


public abstract class DaoBase {
	
	private static final Object lock = new Object();
	private static DataSource DS = null;
	private JdbcTemplate jdbc;
	
	static {
		synchronized (lock) {
			if (DS==null) {
				try {
					PoolFactory dp = new PoolFactory("/wsl/rdf/conf/datasource.conf");
					DS = dp.getDataSource();
				} catch (Exception e1) {
					Tools.pl("数据池初始化错误");
					e1.printStackTrace();
				}
			}
		}
	}
	
	public DaoBase() {
		jdbc = new JdbcTemplate(DS);
	}
	
	/** 返回jdbc对象 */
	public JdbcTemplate jdbc() {
		return jdbc;
	}
}
