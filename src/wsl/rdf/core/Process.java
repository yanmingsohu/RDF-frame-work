// CatfoOD 2011-7-26 下午09:48:04

package wsl.rdf.core;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jym.sim.util.IServletData;
import jym.sim.util.ResourceLoader;
import jym.sim.util.Tools;

/**
 * 处理器基础类<br>
 * 负责注册处理器到容器中
 * 
 * uri: /data/[table_name]/?[params]<br>
 * 实现类getRegisterName()返回的名字决定这个table_name<br>
 * 配置文件在 /wsl/rdf/conf/process.list
 */
public abstract class Process {

	private static final long serialVersionUID = -1067400198581541766L;
	
	private static final ThreadLocal<IServletData> 
				hdata = new ThreadLocal<IServletData>();

	private static final Map<String, Process> 
				uriMap = new HashMap<String, Process>();
	
	static {
		register();
	}

	private static void register() {
		InputStream in = ResourceLoader.getInputStream("/wsl/rdf/conf/process.list");
		BufferedReader read = new BufferedReader(new InputStreamReader(in));
		
		try {
			String line = read.readLine();
			while (line!=null) {
				if (!line.startsWith("#")) {
					line = line.trim();
					if (line.length()>0) {
						Class<?> c = Class.forName(line);
						Process p = (Process) c.newInstance();
						
						uriMap.put(p.getRegisterName(), p);
						Tools.pl("reg:", "[", p.getRegisterName(), "] -", p.getClass());
					}
				}
				line = read.readLine();
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	
	protected static Process getProcess(String tname) {
		return uriMap.get(tname);
	}
	
	protected void setData(IServletData data) {
		hdata.set(data);
	}
	
	protected IServletData getData() {
		return hdata.get();
	}
	
	/**
	 * 跳转请求forward操作
	 */
	protected void jump(String dscName) throws ServletException, IOException {
		HttpServletRequest req = getData().getHttpServletRequest();
		HttpServletResponse resp = getData().getHttpServletResponse();
		
		if (dscName!=null) {
			RequestDispatcher rd = req.getRequestDispatcher(dscName);
			if (rd!=null) {
				rd.forward(req, resp);
			}
		}
	}
	
/* -------------------------------- 需要子类重写 ------------------------------- */	
	
	/** 如果请求的url与该name相同则转发到该子类的exe() */
	protected abstract String getRegisterName();
	
	/** 应答请求	 */
	protected abstract void exe() throws Exception;
	
/* -------------------------------- 便捷方法 ----------------------------------- */
	
	protected String getParameter(String name) {
		return getData().getParameter(name);
	}
	
	protected void setAttribute(String name, Object obj) {
		getData().setAttribute(name, obj);
	}
	
	protected Object getAttribute(String name) {
		return getData().getAttribute(name);
	}
	
	protected Object getSessionAttr(String name) {
		return getData().getSessionAttribute(name);
	}
	
	protected void setSessionAttr(String name, Object obj) {
		getData().setSessionAttribute(name, obj);
	}
	
	/**
	 * 取得当前应用的路径: http://localhost/rdf/default
	 */
	protected String getAppPath() {
		HttpServletRequest req = getData().getHttpServletRequest();
		
		return "http://" + req.getServerName() + ":" + req.getServerPort()
			   + req.getContextPath() + req.getServletPath();
	}
}
