#include "stdafx.h"
#include "data.hpp"
#include <iostream>
#include <list>
#include <string>
#include <tr1/functional>
#include <fstream>
// #include <map>
#include <sstream>
#include <network.h>
#include <vector>
// #include <hash.h>

using namespace std;


typedef TInt TEdgeData;

typedef struct route
{
  string sourceAirport;
  string sourceCountry;
  string destinationAirport;
  string destinationCountry;
} Route;

PNGraph genRandomGraph(PNGraph G, int nodes, int edges);
int plotGraph(TNodeEDatNet<TNodeData, TEdgeData> &G);
int traverseNodes(TNodeEDatNet<TNodeData, TEdgeData> &G);
int traverseEdges(TNodeEDatNet<TNodeData, TEdgeData> &G);
int traverseGraph(TNodeEDatNet<TNodeData, TEdgeData> &G);
int saveGraph(TNodeEDatNet<TNodeData, TEdgeData> &G);

// TNodeEDatNet<int,int> reee;

vector<Route> getInput();
int addRoute(TNodeEDatNet<TNodeData, TEdgeData> &graph, std::vector<Route> list);
int hashFunction(string str);

int main(int argc, char* argv[]) 
{
  
  // PNGraph loadedGraph = TSnap::LoadEdgeList<PNGraph>("input.txt", 0, 1);
  TNodeEDatNet<TNodeData, TEdgeData> variableGraph;
  vector<Route> list =  getInput();
  addRoute(variableGraph,list);
  plotGraph(variableGraph);

  //  string i1 = "Rawr\n", i2 = "Rawr";
  //   cout << "1st:" <<  i1 << " " << i1.length() << " & 2nd:" << i2 << " " << i2.length() << endl;

  traverseGraph(variableGraph);
  // saveGraph(variableGraph);
  // TSnap::PrintInfo(variableGraph);
  
  

}


vector<Route> getInput()
{
    //Opening filestream
        ifstream FyallStream;

        vector<Route> inputList;
        //Opening file using filename
        FyallStream.open("parsedDomesticsOutput.txt");

        if (FyallStream.peek() == std::ifstream::traits_type::eof())
        {
          cout << "Weak file" << endl;
        }

        if (FyallStream.good())
        {
          cout << "Fyall exists" << endl;
        }
        else
        {
          cout << "Fyall doesn't exists" << endl;
        }
        
        
        
        // Validates if it is a file
        if (FyallStream.is_open())
        {
          Route r1;
          cout << "Come in, its open" << endl;
          string currLine;
          while (getline(FyallStream, currLine))
          {
            // cout << "This is the currLine: " << currLine << endl;
            string temp;
            stringstream s_stream(currLine);
            getline(s_stream, temp, ',');
            r1.sourceAirport = temp;
            // cout << temp +",";
            getline(s_stream, temp, ',');
            r1.sourceCountry = temp;
            // cout << temp +",";
            getline(s_stream, temp, ',');
            r1.destinationAirport = temp;
            // cout << temp +",";
            getline(s_stream, temp, ',');
            r1.destinationCountry = temp.substr(0,temp.length()-1);
            // cout << temp << endl;

            inputList.push_back(r1);
            
          }

         
          cout << "Gays" << endl;
            // Closes the fyallStream
            FyallStream.close();
            cout << "Size = " << inputList.size() << endl;
            return inputList;
        }
        else
        {
            //Closes the fyallStream
            cout << "Fuck off nosey" << endl;
            FyallStream.close();
            return inputList;
        }
}

int addRoute(TNodeEDatNet<TNodeData, TEdgeData> &graph, std::vector<Route> list)
{
	for (size_t i = 0; i < list.size(); i++)
	{
    int idSource = hashFunction(list[i].sourceCountry);
    int idDestination = hashFunction(list[i].destinationCountry);
		// Adds country to graph if they aren't already added
    TNodeData *source = new TNodeData(idSource, list[i].sourceCountry);
		TNodeData *destination = new TNodeData(idDestination, list[i].destinationCountry);




   
    // cout << "Source: " << list[i].sourceCountry << "-" << list[i].sourceCountry.length() << "|";
    // cout << " Destination: " << list[i].destinationCountry << "-" << list[i].destinationCountry.length() << endl;


    if (!graph.IsNode(idSource)) {
      graph.AddNode(idSource, *source);
    }
    if (!graph.IsNode(idDestination)) {
      graph.AddNode(idDestination, *destination);
    }
  
		// Checks if the edge we are adding exists
		if (graph.IsEdge(idSource,idDestination))
		{
			// Increment edge number
			TEdgeData flight = graph.GetEDat(idSource,idDestination);
      // flight.incrementFlights();
      flight++;
			graph.SetEDat(idSource,idDestination, flight);
		}
		else
		{
			// Adds edge to graph
      TEdgeData flight = 1;
			graph.AddEdge(idSource,idDestination, flight);
		}
	}
	return 0;
}


int hashFunction(string str) {
  tr1::hash<string> hashObj;
  // cout << (int)hashObj(str) <<endl;
  return (int) hashObj(str);
}


PNGraph genRandomGraph(PNGraph G, int nodes, int edges)
{
  G = TSnap::GenRndGnm<PNGraph>(nodes, edges);
  cout << "Generated" << endl;
  return G;
}


int traverseGraph(TNodeEDatNet<TNodeData, TEdgeData> &G)
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
int traverseNodes(TNodeEDatNet<TNodeData, TEdgeData> &G)
{
  int counter =0;
  for (TNodeEDatNet<TNodeData, TEdgeData>::TNodeI NI = G.BegNI(); NI < G.EndNI(); NI++) 
    {
      cout << "Node id: " << NI.GetId() << " Name: " << NI.GetDat().country << " In: " << NI.GetInDeg() << " Out: " << NI.GetOutDeg() << endl;
    }
    cout << endl;
    return 0;
}

//From http://snap.stanford.edu/snap/quick.html#input
int traverseEdges(TNodeEDatNet<TNodeData, TEdgeData> &G)
{
  int counter = 0;
   for (TNodeEDatNet<TNodeData, TEdgeData>::TEdgeI EI = G.BegEI(); EI < G.EndEI(); EI++) 
    {
      cout << "Edge: " << EI.GetSrcNDat().country << "->" << EI.GetDstNDat().country << " has " << EI.GetDat();
      if (counter < 1)
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

int saveGraph(TNodeEDatNet<TNodeData, TEdgeData> &G)
{
  //  TSnap::SaveEdgeList(G, "graphTextOut.txt", "Tab-separated list of edges");
  // TSnap::SaveEdgeListNet(G,"networkTextOut.txt","Reeee");
  TFOut FOut("test.graph");
  G.Save(FOut);
  // TSnap::SaveEdgeList<TNodeEDatNet<TNodeData, TEdgeData> >(G,"networkTextOut.txt","Reeee");
  
  // TSnap::DrawGViz
   return 0;
}

int plotGraph(TNodeEDatNet<TNodeData, TEdgeData> &G)
{
  TIntStrH Name;
  int count = 0;
  for (TNodeEDatNet<TNodeData, TEdgeData>::TNodeI NI = G.BegNI(); NI <= G.EndNI(); NI++) 
  {
    // TStr A = NI.GetDat().country;
    Name.AddDat(NI.GetId()) = "Gay";
    
    count++;
  }
 

  // TNGraph graph2 = TSnap::GetKCore(G,3);

  // for (size_t i = 0; i < count; i++)
  // {
  //   /* code */
  // }

  
  
  
  // TSnap::DrawGViz<TNodeEDatNet<TNodeData, TEdgeData> >(G, gvlCirco ,"gviz_plot.png", "", Name);
  cout << "Done" << endl;
  return 0;
}