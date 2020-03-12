#include "stdafx.h"

namespace TSnap{

template<class PGraph>
void SaveGViz(const PGraph& Graph, const TStr& OutFNm, const TStr& Desc, const bool& NodeLabels, const TIntStrH& NIdColorH, const TIntStrH& NIdLabelH);


 template<class PGraph>
void DrawGViz(const PGraph& Graph, const TGVizLayout& Layout, const TStr& PltFNm, const TStr& Desc, const bool& NodeLabels, const TIntStrH& NIdColorH, const TIntStrH& NIdLabelH) {
  const TStr Ext = PltFNm.GetFExt();
  const TStr GraphFNm = PltFNm.GetSubStr(0, PltFNm.Len()-Ext.Len()) + "dot";
  SaveGViz(Graph, GraphFNm, Desc, NodeLabels, NIdColorH, NIdLabelH);
  TSnap::TSnapDetail::GVizDoLayout(GraphFNm, PltFNm, Layout);
}


template<class PGraph>
void SaveGViz(const PGraph& Graph, const TStr& OutFNm, const TStr& Desc, const bool& NodeLabels, const TIntStrH& NIdColorH, const TIntStrH& NIdLabelH) {
  const bool IsDir = HasGraphFlag(typename PGraph::TObj, gfDirected);
  FILE *F = fopen(OutFNm.CStr(), "wt");
  if (! Desc.Empty()) fprintf(F, "/*****\n%s\n*****/\n\n", Desc.CStr());
  if (IsDir) { fprintf(F, "digraph G {\n"); } else { fprintf(F, "graph G {\n"); }
  fprintf(F, "  graph [splines=false overlap=false]\n"); //size=\"12,10\" ratio=fill
  // node  [width=0.3, height=0.3, label=\"\", style=filled, color=black]
  // node  [shape=box, width=0.3, height=0.3, label=\"\", style=filled, fillcolor=red]
  fprintf(F, "  node  [shape=ellipse, width=0.3, height=0.3%s]\n", NodeLabels?"":", label=\"\"");
  // node colors
  //for (int i = 0; i < NIdColorH.Len(); i++) {
  for (typename PGraph::TObj::TNodeI NI = Graph->BegNI(); NI < Graph->EndNI(); NI++) {
    if (NIdColorH.IsKey(NI.GetId())) {
      fprintf(F, "  %d [style=filled, fillcolor=\"%s\", label=\"%s\"];\n", NI.GetId(), NIdColorH.GetDat(NI.GetId()).CStr(), NIdLabelH.GetDat(NI.GetId()).CStr()); }
    else {
      fprintf(F, "  %d ;\n", NI.GetId());
    }
  }
  // edges
  for (typename PGraph::TObj::TNodeI NI = Graph->BegNI(); NI < Graph->EndNI(); NI++) {
    if (NI.GetOutDeg()==0 && NI.GetInDeg()==0 && !NIdColorH.IsKey(NI.GetId())) {
      fprintf(F, "%d;\n", NI.GetId()); }
    else {
      for (int e = 0; e < NI.GetOutDeg(); e++) {
        if (! IsDir && NI.GetId() > NI.GetOutNId(e)) { continue; }
        fprintf(F, "  %d %s %d;\n", NI.GetId(), IsDir?"->":"--", NI.GetOutNId(e));
      }
    }
  }
  if (! Desc.Empty()) {
    fprintf(F, "  label = \"\\n%s\\n\";", Desc.CStr());
    fprintf(F, "  fontsize=24;\n");
  }
  fprintf(F, "}\n");
  fclose(F);
}

}