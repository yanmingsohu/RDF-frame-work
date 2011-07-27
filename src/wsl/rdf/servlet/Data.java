// CatfoOD 2011-7-26 下午09:31:55

package wsl.rdf.servlet;

import jym.sim.util.IServletData;
import jym.sim.util.Tools;


public class Data extends Base {

	private static final long serialVersionUID = -8188101302029569350L;
	

	@Override
	protected void exe(IServletData data) throws Exception {
		Tools.pl("data, " + getTableName());
	}	

}
