#include "DrawGViz.hpp"
#include "stdafx.h"
#include <iostream>
#include <list>
#include <string>
#include <tr1/functional>
#include <fstream>
#include <sstream>
#include <network.h>
#include <vector>


using namespace std;

typedef struct route
{
  string sourceCountry;
  string sourceAirport;
  string destinationAirport;
  string destinationCountry;
} Route;

typedef struct Country
{
  string name;
  int cases;
  int deaths;
  int recovered;
  string date;
} Country;

typedef struct Day {
  string date;
  vector<Country> countries;
} Day;

vector<Day> days;

typedef struct CoronaGraph {
  PNEANet network;
  string date;
} CoronaGraph;



PNEANet initNetwork();

int plotGraph(PNEANet G,TStr fileName);

// Basic traversal
int traverseGraph(PNEANet G);
int traverseNodes(PNEANet G);
int traverseEdges(PNEANet G);




// Creating a visual matrix, mathematical display
vector< vector<int> > initializeVector();
vector< vector<int> > ChangeArry(PNEANet p,vector<vector<int> > owo);
void Print(vector<vector<int> > uwu);


// Getting routes data
vector<Route> getInput();
int addRoute(PNEANet graph, std::vector<Route> list);
int hashFunction(string str);


// Getting virus data
vector<Day> addVirus();
int printVirus(vector<Day> virus);
void graphVirus(Day day,PNEANet G);
bool printGraph = false;


int quarantineNodes(PNEANet G);
int nodeRemoval(PNEANet G , TNEANet::TNodeI C);
int nodeRemoval2(PNEANet G , TNEANet::TNodeI C);



int main(int argc, char* argv[]) 
{
  vector<Route> list =  getInput();
  PNEANet networkG = initNetwork();


  addRoute(networkG,list);
  

  vector<Day> days;
  days = addVirus();
  vector<CoronaGraph> timeline;
  CoronaGraph   fixedGraph;



  for (int i = 0; i < days.size(); i++)
  {
    fixedGraph.network = networkG;
    fixedGraph.date = days.at(i).date;
    graphVirus(days.at(i),fixedGraph.network);
    timeline.push_back(fixedGraph);
  }
  

  
  // plotGraph(timeline.at(51).network,"Un-Fragmented");
    quarantineNodes(timeline.at(51).network);
   plotGraph(timeline.at(51).network,"Fragmented");
  // printVirus(days);
  // graphVirus(days.at(40),networkG);
  cout << "This is the end" << endl;
  
  
    // vector <vector<int> > matrix;
    // matrix = initializeVector();
    // matrix = ChangeArry(networkG,matrix);

}

PNEANet initNetwork()
{
  PNEANet net = PNEANet::New();
  
  net->AddStrAttrN("CountryName","country");
  net->AddIntAttrN("Cases",0);
  net->AddIntAttrN("Quarantined",0);
  net->AddIntAttrE("Flights",0);

  return net;
}


//Flights
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

int hashFunction(string str) {
  tr1::hash<string> hashObj;
  // cout << (int)hashObj(str) <<endl;
  return (int) hashObj(str);
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
    // cout << temp << " is here ae bro" << endl;
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



// Corona
void graphVirus(Day day,PNEANet G)
{
  
  for (int i = 0; i <day.countries.size() ; i++)
  {
    int hash = hashFunction(day.countries.at(i).name);
    
    if (G->IsNode(hash))
    {
      G->AddIntAttrDatN(hash,day.countries.at(i).cases,"Cases");
    }
    
  }
 
 if (printGraph == true)
 {
  TStr temp = day.date.c_str();
  plotGraph(G,temp);
  quarantineNodes(G);
  temp += "_Fragmented";
  // plotGraph(G,temp);
 }
 
  
}

vector<Day> addVirus()
{
   ifstream FyallStream;

        vector<Day> inputList;
        //Opening file using filename
        FyallStream.open("timeline.csv");

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
          Day currDay;
          Country r1;
          string currdate = "";
          int count = 0;
          cout << "Come in, its open" << endl;
          string currLine;
          while (getline(FyallStream, currLine))
          {
            // cout << "This is the currLine: " << currLine << endl;
            string temp;
            stringstream s_stream(currLine);
            getline(s_stream, temp, ',');
            r1.name = temp;
            // cout << temp +",";
            getline(s_stream, temp, ',');
            r1.cases = stoi(temp);
            // cout << temp +",";
            getline(s_stream, temp, ',');
            r1.deaths = stoi(temp);
            // cout << temp +",";
            getline(s_stream, temp, ',');
            r1.recovered = stoi(temp);
             // cout << temp << endl;
            getline(s_stream, temp, ',');
            r1.date = temp;
            // cout << temp << endl;

            if(currdate.compare("") == 0)
            {
              cout << "Gaysssssss" << endl;
              currDay.countries.push_back(r1);
              currDay.date = r1.date;
              currDay.date[2] = '_';
              currDay.date[5] = '_';
              currdate = r1.date;
              count++;
            }
            else if (r1.date.compare(currdate) != 0)
            {
              inputList.push_back(currDay);
              currdate = r1.date;
              currDay.countries.clear();
              currDay.countries.push_back(r1);
              currDay.date = r1.date;
              currDay.date[2] = '_';
              currDay.date[5] = '_';
              count++;
            }
            else
            {
              currDay.countries.push_back(r1);
              currDay.date = r1.date;
              currDay.date[2] = '_';
              currDay.date[5] = '_';
            }
            
          }

         
          cout << "Gays" << endl;
            // Closes the fyallStream
            FyallStream.close();
            cout << "Size = " << count << endl;

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

int printVirus(vector<Day> virus)
{
  int len = virus.size();
  
  cout << "This is the size now: " << len << endl;
  for (int i = 0; i < len; i++)
  {
    cout << "Date: " << virus.at(i).date << endl;
    for (int j = 0; j < virus.at(i).countries.size(); j++)
    {
      cout << virus.at(i).countries.at(j).name << "," <<virus.at(i).countries.at(j).cases << "," << virus.at(i).countries.at(j).deaths << "," << virus.at(i).countries.at(j).recovered << endl;
    }
    cout << "-------------------------------------------------------------------------------------" << endl;
    
  }
  return 0;
  
}

int quarantineNodes(PNEANet G)
{
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++)
  {
    if (G->GetIntAttrDatN(NI,"Cases") >0)
      {
          TNEANet::TNodeI currNode;
          for (int i = 0;  i < NI.GetInDeg(); i++)
        {
          currNode = G->GetNI(NI.GetOutNId(i));
          printf("The degrees of this node are %d|%d\n", currNode.GetInDeg(),currNode.GetOutDeg());
          //  std::cout << " The current node is: " <<currNode.GetId() << endl;
          nodeRemoval(G,currNode);
          // nodeRemoval(G,currNode);
          nodeRemoval2(G,currNode);
        }
      }
  }
  return 0;
}

int nodeRemoval(PNEANet G , TNEANet::TNodeI C)
{
  std::cout << "The current node is: " <<C.GetId() << "(";
  printf("%s)\n",G->GetStrAttrDatN(C.GetId(),"CountryName").CStr());
  TNEANet::TNodeI checkNode;
  for (int i = 0;  i < C.GetInDeg(); i++)
       {
         if(G->GetIntAttrDatN(C.GetInNId(i),"Cases")==0)
         {
           checkNode = G->GetNI(C.GetInNId(i));
           if(G->GetIntAttrDatN(checkNode.GetId(),"Quarantined") == 0)
           {
             G->AddIntAttrDatN(checkNode.GetId(),2,"Quarantined");
           }
          std::cout << "\tThe Extention node is: " <<checkNode.GetId();
          printf("(%s)\n",G->GetStrAttrDatN(checkNode.GetId(),"CountryName").CStr());
            if (G->IsEdge(checkNode.GetId(),C.GetId()))
            {
              G->DelEdge(checkNode.GetId(),C.GetId());
              if(G->GetIntAttrDatN(C.GetId(),"Quarantined") == 0)
              {
                G->AddIntAttrDatN(C.GetId(),1,"Quarantined");
              }
            }
            if (G->IsEdge(C.GetId(),checkNode.GetId()))
            {
              G->DelEdge(C.GetId(),checkNode.GetId());
              if(G->GetIntAttrDatN(C.GetId(),"Quarantined") == 0)
              {
                
                G->AddIntAttrDatN(C.GetId(),1,"Quarantined");
              }
              
            }
            
            
            
         }
       }
  return 0;
}
int nodeRemoval2(PNEANet G , TNEANet::TNodeI C)
{
  std::cout << "The current node is: " <<C.GetId() << "(";
  printf("%s)\n",G->GetStrAttrDatN(C.GetId(),"CountryName").CStr());
  TNEANet::TNodeI checkNode;
  for (int i = 0;  i < C.GetOutDeg(); i++)
       {
         if(G->GetIntAttrDatN(C.GetOutNId(i),"Cases")==0)
         {
           checkNode = G->GetNI(C.GetOutNId(i));
           if(G->GetIntAttrDatN(checkNode.GetId(),"Quarantined") == 0)
           {
             G->AddIntAttrDatN(checkNode.GetId(),2,"Quarantined");
           }
          std::cout << "\tThe Extention node is: " <<checkNode.GetId();
          printf("(%s)\n",G->GetStrAttrDatN(checkNode.GetId(),"CountryName").CStr());
            if (G->IsEdge(checkNode.GetId(),C.GetId()))
            {
              G->DelEdge(checkNode.GetId(),C.GetId());
              if(G->GetIntAttrDatN(C.GetId(),"Quarantined") == 0)
              {
                G->AddIntAttrDatN(C.GetId(),1,"Quarantined");
              }
            }
            if (G->IsEdge(C.GetId(),checkNode.GetId()))
            {
              G->DelEdge(C.GetId(),checkNode.GetId());
              if(G->GetIntAttrDatN(C.GetId(),"Quarantined") == 0)
              {
                
                G->AddIntAttrDatN(C.GetId(),1,"Quarantined");
              }
              
            }
            
            
            
         }
       }
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

int plotGraph(PNEANet G, TStr fileName)
{
  TIntStrH Name;
  int count = 0;
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++) 
  {
    TStr curr = G->GetStrAttrDatN(NI,"CountryName") + ":" + G->GetIntAttrDatN(NI,"Cases").GetStr();
    Name.AddDat(NI.GetId()) = curr;
    cout << count << " of " << G->GetNodes() << endl;
    count++;
  }
 
  cout << "Names sent" << endl;
  // TSnap::DrawGViz<PNEANet>(G, gvlNeato ,"nonColoured.png", "Reeee", Name);
  cout << "GraphViz 1 done" << endl;
    // printf("Node ID: %d Name: %s", G->EndNI().GetId(),G->GetStrAttrDatN(G->EndNI(),"CountryName").CStr());
  
  
  TInt highest = 0;
  // for (TNEANet::TNodeI NI = G->BegNI()++; NI < G->EndNI(); NI++)
  // {
  //   if (NI.GetDeg() > highest)
  //   {
  //     highest = NI.GetDeg();
  //   }
  // }

  TIntStrH Colors;
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++)
  {

    if (G->GetIntAttrDatN(NI,"cases")>0)
    {
      Colors.AddDat(NI.GetId()) ="#FF0000";
    }
    else if(G->GetIntAttrDatN(NI.GetId(),"Quarantined")==1)
    {
       Colors.AddDat(NI.GetId()) = "#0000ff";
    }
    else if(G->GetIntAttrDatN(NI.GetId(),"Quarantined")==2)
    {
      Colors.AddDat(NI.GetId()) = "#FFA500";
    }
    else
    {
      Colors.AddDat(NI.GetId()) = "#008000";
    }
    
    
    
  //  if (NI.GetDeg() < (highest/8))
  //  {
  //   Colors.AddDat(NI.GetId()) = "#f7fcfd";
  //  }
  //  else if (NI.GetDeg() < (highest/8)*2)
  //  {
  //    Colors.AddDat(NI.GetId()) = "#e0ecf4";
  //  }
  //   else if (NI.GetDeg() < (highest/8)*3)
  //  {
  //    Colors.AddDat(NI.GetId()) = "#bfd3e6";
  //  }
  //   else if (NI.GetDeg() < (highest/8)*4)
  //  {
  //    Colors.AddDat(NI.GetId()) = "#9ebcda";
  //  }
  //  else if (NI.GetDeg() < (highest/8)*5)
  //  {
  //    Colors.AddDat(NI.GetId()) = "#8c96c6";
  //  }
  //  else if (NI.GetDeg() < (highest/8)*6)
  //  {
  //    Colors.AddDat(NI.GetId()) = "#8c6bb1";
  //  }
  //  else if (NI.GetDeg() < (highest/8)*7)
  //  {
  //    Colors.AddDat(NI.GetId()) = "#88419d";
  //  }
  //  else
  //  {
  //    Colors.AddDat(NI.GetId()) = "#6e016b";
  //  }   
  }
  cout << "Colours set" << endl;

  string temp = ".png";
  TStr path = "Graphs/";
  path+= fileName.CStr();
  path += temp.c_str();
  printf("%s \n",path.CStr());
  TSnap::DrawGViz<PNEANet>(G, gvlNeato ,path.CStr(), fileName,false,Colors,Name);
  
  cout << "Done" << endl;
  return 0;
}





// Matrix
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


