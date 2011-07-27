// CatfoOD 2011-7-26 下午09:31:55

package wsl.rdf.servlet.impl;

import wsl.rdf.dao.impl.DefaultDao;
import wsl.rdf.dao.impl.RequestBean;
import wsl.rdf.servlet.Process;


public class Default extends Process {

	private static final long serialVersionUID = -8188101302029569350L;
	private DefaultDao dao;
	
	
	public Default() {
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
