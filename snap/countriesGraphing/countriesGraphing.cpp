#include "DrawGViz.hpp"
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
  string sourceCountry;
  string sourceAirport;
  string destinationAirport;
  string destinationCountry;
} Route;

PNGraph genRandomGraph(PNGraph G, int nodes, int edges);
int plotGraph(TNodeEDatNet<TNodeData, TEdgeData> &G);
int plotGraph(PNEANet G);
int traverseNodes(TNodeEDatNet<TNodeData, TEdgeData> &G);
int traverseEdges(TNodeEDatNet<TNodeData, TEdgeData> &G);
int traverseGraph(TNodeEDatNet<TNodeData, TEdgeData> &G);
int traverseGraph(PNEANet G);
int traverseNodes(PNEANet G);
int traverseEdges(PNEANet G);
int saveGraph(TNodeEDatNet<TNodeData, TEdgeData> &G);
int getCentrality(PNEANet G);

// TNodeEDatNet<int,int> reee;

vector< vector<int> > initializeVector();
vector< vector<int> > ChangeArry(PNEANet p,vector<vector<int> > owo);
void Print(vector<vector<int> > uwu);


vector<Route> getInput();
int addRoute(TNodeEDatNet<TNodeData, TEdgeData> &graph, std::vector<Route> list);
int addRoute(PNEANet graph, std::vector<Route> list);
int hashFunction(string str);

int main(int argc, char* argv[]) 
{
  
  // PNGraph loadedGraph = TSnap::LoadEdgeList<PNGraph>("input.txt", 0, 1);
  TNodeEDatNet<TNodeData, TEdgeData> variableGraph;
  vector<Route> list =  getInput();
  // addRoute(variableGraph,list);
  

  PNEANet networkG = PNEANet::New();

  networkG->AddStrAttrN("CountryName","country");
  networkG->AddIntAttrE("Flights",0);

  addRoute(networkG,list);

  //  string i1 = "Rawr\n", i2 = "Rawr";
  //   cout << "1st:" <<  i1 << " " << i1.length() << " & 2nd:" << i2 << " " << i2.length() << endl;

  traverseGraph(networkG);
  plotGraph(networkG);
  // saveGraph(variableGraph);
  // TSnap::PrintInfo(variableGraph);
  
  // vector <vector<int> > matrix;
  // matrix = initializeVector();
  // matrix = ChangeArry(networkG,matrix);
  // Print(matrix);

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
            r1.destinationCountry = temp;
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


int addRoute(PNEANet graph, std::vector<Route> list)
{
	for (int i = 0; i < list.size(); i++)
	{
    int idSource = hashFunction(list[i].sourceCountry);
    int idDestination = hashFunction(list[i].destinationCountry);
		// Adds country to graph if they aren't already added

  
    char temp[(list[i].sourceCountry).length()+1];
    strcpy(temp,list[i].sourceCountry.c_str());
    cout << temp << " is here ae bro" << endl;
    TStr source = temp;

    char temp2[list[i].destinationCountry.length()];
    strcpy(temp2,list[i].destinationCountry.c_str());
    TStr dest = temp2;

  
  
  

   
    // cout << "Source: " << list[i].sourceCountry << "-" << list[i].sourceCountry.length() << "|";
    // cout << " Destination: " << list[i].destinationCountry << "-" << list[i].destinationCountry.length() << endl;


    if (!graph->IsNode(idSource)) {
      graph->AddNode(idSource);
      graph->AddStrAttrDatN(graph->GetNI(idSource),source,"CountryName");
    }
    if (!graph->IsNode(idDestination)) {
      graph->AddNode(idDestination);
      graph->AddStrAttrDatN(graph->GetNI(idDestination),dest,"CountryName");
    }
  
		// Checks if the edge we are adding exists
		if (graph->IsEdge(idSource,idDestination))
		{
			// Increment edge number
		
			graph->AddIntAttrDatE(graph->GetEI(idSource,idDestination),graph->GetIntAttrDatE(graph->GetEI(idSource,idDestination),"Flights")+1,"Flights");
		}
		else
		{
			// Adds edge to graph
      
			graph->AddEdge(idSource,idDestination);
      graph->AddIntAttrDatE(graph->GetEI(idSource,idDestination),1,"Flights");
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

int traverseGraph(PNEANet G)
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
int traverseNodes(PNEANet G)
{
  int counter =0;


  printf("Start: %s and out: %d reeee\n", G->GetStrAttrDatN(G->BegNI(),"CountryName").CStr(),G->BegNI().GetOutDeg());

  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++) 
    {
      printf("Node id: %d | Name: %s | In: %d | Out: %d\n",NI.GetId(),G->GetStrAttrDatN(NI,"CountryName").CStr(),NI.GetInDeg(),NI.GetOutDeg());
      // cout << "Node id: " << NI.GetId() << " Name: " << NI.GetStrAttrNames() << " In: " << NI.GetInDeg() << " Out: " << NI.GetOutDeg() << endl;
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

int traverseEdges(PNEANet G)
{
  int counter = 0;
   for (TNEANet::TEdgeI EI = G->BegEI(); EI < G->EndEI(); EI++) 
    { 
      printf("Edge: %s->%s has %d",G->GetStrAttrDatN(EI.GetSrcNId(),"CountryName").CStr(),G->GetStrAttrDatN(EI.GetDstNId(),"CountryName").CStr(),G->GetIntAttrDatE(EI,"Flights"));
      // cout << "Edge: " << EI.GetSrcNDat().country << "->" << EI.GetDstNDat().country << " has " << EI.GetDat();
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

int plotGraph(PNEANet G)
{
  TIntStrH Name;
  int count = 0;
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++) 
  {
    TStr curr = G->GetStrAttrDatN(NI,"CountryName");
    Name.AddDat(NI.GetId()) = curr;
    cout << count << " of " << G->GetNodes() << endl;
    count++;
  }
 
  cout << "Names sent" << endl;
  // TSnap::DrawGViz<PNEANet>(G, gvlNeato ,"nonColoured.png", "Reeee", Name);
  cout << "GraphViz 1 done" << endl;
    // printf("Node ID: %d Name: %s", G->EndNI().GetId(),G->GetStrAttrDatN(G->EndNI(),"CountryName").CStr());
  
  
  TInt highest = 0;
  for (TNEANet::TNodeI NI = G->BegNI()++; NI < G->EndNI(); NI++)
  {
    if (NI.GetDeg() > highest)
    {
      highest = NI.GetDeg();
    }
  }

  TIntStrH Colors;
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++)
  {
   if (NI.GetDeg() < (highest/8))
   {
    Colors.AddDat(NI.GetId()) = "#f7fcfd";
   }
   else if (NI.GetDeg() < (highest/8)*2)
   {
     Colors.AddDat(NI.GetId()) = "#e0ecf4";
   }
    else if (NI.GetDeg() < (highest/8)*3)
   {
     Colors.AddDat(NI.GetId()) = "#bfd3e6";
   }
    else if (NI.GetDeg() < (highest/8)*4)
   {
     Colors.AddDat(NI.GetId()) = "#9ebcda";
   }
   else if (NI.GetDeg() < (highest/8)*5)
   {
     Colors.AddDat(NI.GetId()) = "#8c96c6";
   }
   else if (NI.GetDeg() < (highest/8)*6)
   {
     Colors.AddDat(NI.GetId()) = "#8c6bb1";
   }
   else if (NI.GetDeg() < (highest/8)*7)
   {
     Colors.AddDat(NI.GetId()) = "#88419d";
   }
   else
   {
     Colors.AddDat(NI.GetId()) = "#6e016b";
   }   
  }
  cout << "Colours set" << endl;
  // G, gvlNeato ,"gviz_plot.png", "Reeee", Name
  TSnap::DrawGViz<PNEANet>(G, gvlNeato ,"coloured.png", "Reeee",false,Colors,Name);
  
  cout << "Done" << endl;
  return 0;
}



vector< vector<int> > initializeVector()
{
	vector<vector<int> > rawr;

	for (int i = 0; i <10; i++)
	{   vector<int> col;
	    rawr.push_back(col);
	    for (int j = 0; j <10; j++) 
	    {
	      rawr[i].push_back(0);
	    } 
	}
	return rawr;
}

vector< vector<int> > ChangeArry(PNEANet p,vector<vector<int> > owo)
{
	// for (TNEANet::TEdgeI EI = p->BegEI(); EI < p->EndEI(); EI++)
	// {
	// for (int i = 0; i <10; i++)
	// {   
	//     for (int j = 0; j <10; j++) 
	//     {
	//         if (i==EI.GetSrcNId() && j== EI.GetDstNId() )
	//         {
	//             owo[i][j]= EI.GetSrcNId()+1/(EI.GetDstNId()+1);
	//         }
	        
	//     } 
	// }
	// }

  TInt highest = 0;
  for (TNEANet::TNodeI NI = p->BegNI()++; NI < p->EndNI(); NI++)
  {
    if (NI.GetDeg() > highest)
    {
      highest = NI.GetDeg();
    }
  }

    //Opening filestream
        ofstream FyallStream;

        //Opening file using filename
        FyallStream.open("1Doutput.txt");

        //Validates if it is a file
        if (FyallStream.fail() == false)
        {
          int i = 0;
          for (TNEANet::TNodeI NI1 = p->BegNI(); NI1 < p->EndNI(); NI1++)
          {
            int j = 0;
            for (TNEANet::TNodeI NI2 = p->BegNI(); NI2 < p->EndNI(); NI2++)
            {
              int flights = p->GetIntAttrDatE(p->GetEId(NI1.GetId(),NI2.GetId()),"Flights");
              owo[i][j] = flights;
              if (NI1.GetId() == NI2.GetId())
              {
                cout << "\033[97m"<< "■ \033[0m";
              }
              else if(flights<highest/9)
              {
                cout << "\033[90m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*2)
              {
                cout << "\033[96m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*3)
              {
                cout << "\033[36m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*4)
              {
                cout << "\033[92m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*5)
              {
                cout << "\033[93m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*6)
              {
                cout << "\033[33m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*7)
              {
                cout << "\033[91m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*8)
              {
                cout << "\033[31m"<< "■ \033[0m";
              }
              else if(flights <= highest)
              {
                cout << "\033[30m"<< "■ \033[0m";
              }
              
              FyallStream.close();
            }  
            cout << endl;
          }
        }
	return owo;
}

void Print(vector<vector<int> > uwu)
{
  for (int i = 0; i < uwu.size(); i++) 
  { 
    for (int j = 0; j < uwu[i].size(); j++)
    {
      cout << uwu[i][j] << ""; 
      cout << endl; 
    } 
  } 
}

int getCentrality(PNEANet G)
{
  
}
