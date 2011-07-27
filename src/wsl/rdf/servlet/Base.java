// CatfoOD 2011-7-26 下午09:48:04

package wsl.rdf.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jym.sim.util.IServletData;
import jym.sim.util.ServletData;

public abstract class Base extends HttpServlet {

	private static final long serialVersionUID = -1067400198581541766L;
	private static final ThreadLocal<IServletData> 
				hdata = new ThreadLocal<IServletData>();

	/**
	 * 应答请求
	 */
	protected abstract void exe(IServletData data) throws Exception;
	
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		try {
			IServletData sd = new ServletData(req, resp);
			hdata.set(sd);
			exe(sd);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	protected String getTableName() throws ServletException {
		HttpServletRequest req = hdata.get().getHttpServletRequest();
		
		String uri = req.getRequestURI();
		String suri = req.getServletPath();
		int i = uri.indexOf(suri);
		
		if (i>=0) {
			i += suri.length() + 1;
			int e = uri.indexOf('/', i);
			if (e>=0) {
				return uri.substring(i, e);
			}
		}
		
		throw new ServletException("无效的URI, 没找到Table Name");
	}
}
