#include "stdafx.h"
#include <iostream>
using namespace std;

PNGraph genRandomGraph(PNGraph G, int nodes, int edges);
int plotGraph(PNGraph G);
int traverseNodes(PNGraph G);
int traverseEdges(PNGraph G);
int traverseGraph(PNGraph G);


int main(int argc, char* argv[]) 
{
 
  // PNGraph loadedGraph = TSnap::LoadEdgeList<PNGraph>("input.txt", 0, 1);
  PNGraph variableGraph;
  variableGraph = genRandomGraph(variableGraph,10,50);
  traverseGraph(variableGraph);
  plotGraph(variableGraph);
  

}

PNGraph genRandomGraph(PNGraph G, int nodes, int edges)
{
  G = TSnap::GenRndGnm<PNGraph>(nodes, edges);
  cout << "Generated" << endl;
  return G;
}


int traverseGraph(PNGraph G)
{
  cout << "Nodes" << endl;
  cout << "_____________" << endl;
  traverseNodes(G);
  cout << "-------------" << endl << endl;
  cout << "Edges" << endl;
  cout << "_____________" << endl;
  traverseEdges(G);
  return 0;
}


//From http://snap.stanford.edu/snap/quick.html#input
int traverseNodes(PNGraph G)
{
  int counter =0;
  for (TNGraph::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++) 
    {
      cout << "Node id: " << NI.GetId() << " with out-degree " << NI.GetOutDeg() << " and in-degree " << NI.GetInDeg();
      if (counter < 2)
      {
        cout << " | ";
        counter++;
      }
      else
      {
        cout << endl;
        counter = 0;
      }
    }
    cout << endl;
    return 0;
}

//From http://snap.stanford.edu/snap/quick.html#input
int traverseEdges(PNGraph G)
{
  int counter = 0;
   for (TNGraph::TEdgeI EI = G->BegEI(); EI < G->EndEI(); EI++) 
    {
      cout << "Edge: " << EI.GetSrcNId() << "," << EI.GetDstNId();
      if (counter < 4)
      {
        cout << " | ";
        counter++;
      }
      else
      {
        cout << endl;
        counter = 0;
      }
    }
    cout << endl;
    return 0;
}

int saveGraph(PNGraph G)
{
   TSnap::SaveEdgeList(G, "graphTextOut.txt", "Tab-separated list of edges");
   return 0;
}

int plotGraph(PNGraph G)
{
  TIntStrH Name;
  int count = 0;
  for (TNGraph::TNodeI NI = G->BegNI(); NI <= G->EndNI(); NI++) 
  {
    Name.AddDat(NI.GetId()) = NI.GetId();
    count++;
  }
 
  

  TSnap::DrawGViz<PNGraph>(G, gvlCirco ,"gviz_plot.png", "", Name);
  cout << "Done" << endl;
  return 0;
}