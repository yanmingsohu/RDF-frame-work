// CatfoOD 2011-7-26 下午09:31:55

package wsl.rdf.process;

import wsl.rdf.core.Process;
import wsl.rdf.struct.RequestBean;


public class DefaultPro extends Process {

	private static final long serialVersionUID = -8188101302029569350L;
	private DefaultDao dao;
	
	
	public DefaultPro() {
		dao = new DefaultDao();
	}

	@Override
	protected void exe() throws Exception {
		RequestBean model = new RequestBean();
		
		model.setKey(getParameter("key"));
		model.setId(getParameter("id"));
		
		setAttribute("list", dao.search(model));
		setAttribute("ns", model.getNameSpaceDefine());
		
		jump("/WEB-INF/jsp/rdf_default.jsp");
	}

	@Override
	protected String getRegisterName() {
		return "default";
	}	

}
