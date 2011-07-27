// CatfoOD 2011-7-27 下午01:48:44 yanming-sohu@sohu.com/@qq.com

package wsl.rdf.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jym.sim.util.IServletData;
import jym.sim.util.ServletData;


/**
 * uri: /data/[table_name]/?[params]<br>
 * 
 * 自动根据table_name转发到指定的servlet
 */
public class RdfServlet extends HttpServlet {

	private static final long serialVersionUID = 254841637358041281L;
	

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		try {
			/* 根据请求uri中的table_name值转发请求 */
			String tname = getTableName(req);
			Process process = Process.getProcess(tname);
			
			if (process!=null) {
				IServletData sd = new ServletData(req, resp);
				process.setData(sd);
				process.exe();
			} else {
				throw new ServletException("该name: [" + tname + "] 没有实现");
			}
		} catch (Exception e) {
			throw new ServletException(e);
		}
	}
	
	protected String getTableName(HttpServletRequest req) throws ServletException {
		
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
