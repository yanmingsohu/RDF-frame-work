// CatfoOD 2011-7-26 下午09:53:09

package wsl.rdf.servlet;

import jym.sim.util.IServletData;
import jym.sim.util.Tools;


public class NameSpace extends Base {

	private static final long serialVersionUID = 5690421270410627732L;

	
	@Override
	protected void exe(IServletData data) throws Exception {
		Tools.pl("ns, "  + getTableName());
	}

}
