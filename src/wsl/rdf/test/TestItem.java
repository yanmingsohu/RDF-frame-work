// CatfoOD 2011-7-27 下午07:44:12

package wsl.rdf.test;

import jym.sim.util.Tools;
import wsl.rdf.struct.EntryItem;


public class TestItem {


	public static void main(String[] args) {
		EntryItem ei = new EntryItem();
//		ei.pushValue("hello",  "dc", "a", "b", "c", null);
//		ei.pushValue("hello2", "dc", "a", "b", "d", null);
		ei.pushValue("hello3", "dc", "a", "b", "d", null);
		ei.pushValue("hello9", "b", null);
		Tools.pl(ei);
	}

}
