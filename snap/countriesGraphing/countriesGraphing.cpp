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
  int population;
  float casesPerMillion;
  string continent;
  string date;
} Country;

typedef struct Day 
{
  string date;
  vector<Country> countries;
} Day;

vector<Day> days;

typedef struct CoronaGraph 
{
  PNEANet network;
  string date;
} CoronaGraph;

typedef struct Predicted
{
  string country;
  float rate;
};

vector<Predicted> predictedList;

vector<Predicted> getPredictions(PNEANet G);



PNEANet initNetwork();

int plotGraph(PNEANet G,TStr fileName);

// Basic traversal
int traverseGraph(PNEANet G);
int traverseNodes(PNEANet G);
int traverseEdges(PNEANet G);




// Creating a visual matrix, mathematical display
vector< vector<int> > initializeVector();
vector< vector<int> > ChangeArry(PNEANet p,vector<vector<int> > matrix);
void Print(vector<vector<int> > matrix);


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
int nodeRemoval1(PNEANet G , TNEANet::TNodeI C);
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
  
// std::cout << "Reeee" << endl;
//   vector<Predicted> pred = getPredictions(networkG);
// std::cout << "Gays" << endl;

//   for (int i = 0; i < pred.size(); i++)
//   {
//     printf("%s  : %f\n",pred.at(i).country.c_str(),pred.at(i).rate);
//   }
  



  // plotGraph(timeline.at(51).network,"Un-Fragmented");
    quarantineNodes(timeline.at(51).network);
    plotGraph(timeline.at(51).network,"Fragmented");
 
  std::cout << "This is the end" << endl;
  
  
    // vector <vector<int> > matrix;
    // matrix = initializeVector();
    // matrix = ChangeArry(networkG,matrix);

}

PNEANet initNetwork()
{
  PNEANet net = PNEANet::New();

  // Adds all neccessary attributes needed for nodes and edges
  net->AddStrAttrN("CountryName","country");
  net->AddIntAttrN("cases",0);
  net->AddIntAttrN("deaths",0);
  net->AddIntAttrN("recovered",0);
  net->AddIntAttrN("population",0);
  net->AddStrAttrN("continent","Reeee");
  net->AddFltAttrN("casesPerMillion",0.0);
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
      std::cout << "File empty" << endl;
    }

    if (FyallStream.good())
    {
      std::cout << "File exists" << endl;
    }
    else
    {
      std::cout << "File not found" << endl;
    }
        
    // Validates if it is a file
    if (FyallStream.is_open())
    {
      Route r1;
      string currLine;
      
      // Reads file line by line
      while (getline(FyallStream, currLine))
      {
        string temp;
        stringstream s_stream(currLine);

        // Sets source airport to first delimited value
        getline(s_stream, temp, ',');
        r1.sourceAirport = temp;

        // Sets source country to second delimited value
        getline(s_stream, temp, ',');
        r1.sourceCountry = temp;

        // Sets destination airport to third delimited value
        getline(s_stream, temp, ',');
        r1.destinationAirport = temp;

        // Sets destination country to fourth delimited value
        getline(s_stream, temp, ',');
        r1.destinationCountry = temp;

        // Adds current delimited line to vector
        inputList.push_back(r1);
        
      }

      
        // Closes the File Stream
        FyallStream.close();
        return inputList;
    }
    else
    {
        //Closes the File Stream
        FyallStream.close();
        return inputList;
    }
}

int hashFunction(string str) 
{
  tr1::hash<string> hashObj;
  return (int) hashObj(str);
}

int addRoute(PNEANet graph, std::vector<Route> list)
{
  // Loops through items in the vector (obviously)
	for (int i = 0; i < list.size(); i++)
	{

    // Creates ID's for source an destination countries
    int idSource = hashFunction(list[i].sourceCountry);
    int idDestination = hashFunction(list[i].destinationCountry);
		  
    // Converting to TStrings for adding attributes
    TStr source = list[i].sourceCountry.c_str();
    TStr dest = list[i].destinationCountry.c_str();

    // Adds source country to graph if it doesn't already exist
    if (!graph->IsNode(idSource)) {
      graph->AddNode(idSource);
      graph->AddStrAttrDatN(graph->GetNI(idSource),source,"CountryName");
    }

    // Adds destination country to graph if it doesn't already exist
    if (!graph->IsNode(idDestination)) {
      graph->AddNode(idDestination);
      graph->AddStrAttrDatN(graph->GetNI(idDestination),dest,"CountryName");
    }
  
		// Checks if the edge to be added already exists
		if (graph->IsEdge(idSource,idDestination))
		{
			// Increments flights attribute
			graph->AddIntAttrDatE(graph->GetEI(idSource,idDestination),graph->GetIntAttrDatE(graph->GetEI(idSource,idDestination),"Flights")+1,"Flights");
		}
		else
		{
			// Adds new edge to graph
			graph->AddEdge(idSource,idDestination);
      graph->AddIntAttrDatE(graph->GetEI(idSource,idDestination),1,"Flights");
		}
	}
	return 0;
}



// Corona
void graphVirus(Day day,PNEANet G)
{
  
  // Loops through infected countries on a given day
  for (int i = 0; i <day.countries.size() ; i++)
  {
    int hash = hashFunction(day.countries.at(i).name);
    //Node existence check
    if (G->IsNode(hash))
    {
      //Adds attributes to node from list
      G->AddIntAttrDatN(hash,day.countries.at(i).cases,"cases");
      G->AddIntAttrDatN(hash,day.countries.at(i).deaths,"deaths");
      G->AddIntAttrDatN(hash,day.countries.at(i).recovered,"recovered");
      G->AddIntAttrDatN(hash,day.countries.at(i).population,"population");
      G->AddStrAttrDatN(hash,day.countries.at(i).continent.c_str(),"continent");

      TFlt t = 0;
      t = float(G->GetIntAttrDatN(hash,"cases"))/float(G->GetIntAttrDatN(hash,"population"));
      t *= 1000000;
      G->AddFltAttrDatN(hash,t,"casesPerMillion");
    }
    
  }

  // Plots current day before and after suggested quarantine (Only if preset to run this part)
  if (printGraph == true)
  {
    TStr fileName = day.date.c_str();
    plotGraph(G,fileName);
    quarantineNodes(G);
    fileName += "_Quarantined";
    plotGraph(G,fileName);
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
          std::cout << "File empty" << endl;
        }

        if (FyallStream.good())
        {
          std::cout << "File exists" << endl;
        }
        else
        {
          std::cout << "File not found" << endl;
        }
        
        // Validates if it is a file
        if (FyallStream.is_open())
        {
          Day currDay;
          Country r1;

          string currdate = "";
          int count = 0;
          string currLine;

          // Loops through each line in file
          while (getline(FyallStream, currLine))
          {
            string temp;
            stringstream s_stream(currLine);
            
            // Sets name to first delimited value
            getline(s_stream, temp, ',');
            r1.name = temp;

            // Sets number of cases to second delimited value
            getline(s_stream, temp, ',');
            r1.cases = stoi(temp);

            // Sets number of deaths to third delimited value
            getline(s_stream, temp, ',');
            r1.deaths = stoi(temp);

            // Sets number of recovered to fourth delimited value
            getline(s_stream, temp, ',');
            r1.recovered = stoi(temp);

             // Sets population to fifth delimited value
            getline(s_stream, temp, ',');
            r1.population = stoi(temp);

            // Sets continent value to sixth delimited value
            getline(s_stream, temp, ',');
            r1.continent = temp;

            // Sets date to seventh delimited value
            getline(s_stream, temp, ',');
            r1.date = temp;

            // If current days date field is empty. 
            if(currdate.compare("") == 0)
            {
              currDay.date = r1.date;

              
              
              currDay.countries.push_back(r1);
              currdate = r1.date;

              // Replaces backslashes with underscores
              currDay.date[2] = '_';
              currDay.date[5] = '_';
              count++;
            }
            else if (r1.date.compare(currdate) != 0)
            {
              inputList.push_back(currDay);
              currdate = r1.date;
              currDay.countries.clear();
              currDay.countries.push_back(r1);
              currDay.date = r1.date;

              // Replaces backslashes with underscores
              currDay.date[2] = '_';
              currDay.date[5] = '_';

              
              count++;
            }
            else
            {
              currDay.countries.push_back(r1);
              currDay.date = r1.date;
              
              // Replaces backslashes with underscores
              currDay.date[2] = '_';
              currDay.date[5] = '_';
            }
            
          }

         
       
            // Closes the File Stream
            FyallStream.close();

            return inputList;
        }
        else
        {
            //Closes the File Stream
            FyallStream.close();
            return inputList;
        }
}

int printVirus(vector<Day> virus)
{
  int len = virus.size();
  for (int i = 0; i < len; i++)
  {
    std::cout << "Date: " << virus.at(i).date << endl;
    for (int j = 0; j < virus.at(i).countries.size(); j++)
    {
      std::cout << virus.at(i).countries.at(j).name << "," <<virus.at(i).countries.at(j).cases << "," << virus.at(i).countries.at(j).deaths << "," << virus.at(i).countries.at(j).recovered << endl;
    }
    std::cout << "-------------------------------------------------------------------------------------" << endl;
    
  }
  return 0;
  
}

int quarantineNodes(PNEANet G)
{

  //Finding "In Danger Nodes"
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++)
  {
    if (G->GetIntAttrDatN(NI.GetId(),"Cases")>0)
    {
      for (int i = 0; i < NI.GetOutDeg(); i++)
      {
        if (G->GetIntAttrDatN(NI.GetOutNId(i),"Cases") == 0 && G->GetIntAttrDatN(NI.GetOutNId(i),"Quarantined") != 1)
        {
          G->AddIntAttrDatN(NI.GetOutNId(i),1,"Quarantined");
        }
      }
      for (int i = 0; i < NI.GetInDeg(); i++)
      {
        if (G->GetIntAttrDatN(NI.GetInNId(i),"Cases") == 0 && G->GetIntAttrDatN(NI.GetInNId(i),"Quarantined") != 1)
        {
          G->AddIntAttrDatN(NI.GetInNId(i),1,"Quarantined");
        }
      }
    }
  }

  // Deleting edges
  for(TNEANet::TNodeI NI = G->BegNI(); NI<G->EndNI(); NI++)
  {
    if (!G->IsNode(NI.GetId()))
    {
      continue;
    }
    
    if (G->GetIntAttrDatN(NI.GetId(),"Quarantined") == 1)
    {
      nodeRemoval(G,NI);
      nodeRemoval2(G,NI);
    }
    
  }

  return 0; 
}
int nodeRemoval(PNEANet G , TNEANet::TNodeI C)
{
  std::cout << "Inwards node removal" << endl;
  if (C.GetInDeg()>0)
  {  
    for (int i = 0; i < C.GetInDeg(); i++)
    {
      if (!G->IsEdge(C.GetInNId(i),C.GetId()))
      {
        continue;
      }
      
      if (G->GetIntAttrDatN(C.GetInNId(i),"cases") == 0 && G->GetIntAttrDatN(C.GetInNId(i),"Quarantined") != 1)
      {
        G->AddIntAttrDatN(C.GetInNId(i),2,"Quarantined");
        if (G->IsEdge(C.GetInNId(i),C.GetId()))
        {
           G->DelEdge(C.GetInNId(i),C.GetId());
        }
        
       
      
      }
    }
  }
  return 0;
}
  
int nodeRemoval2(PNEANet G , TNEANet::TNodeI C)
{
  std::cout << "Outwards node removal" << endl;
  if (C.GetOutDeg()>0)
  {  
    for (int i = 0; i < C.GetOutDeg(); i++)
    {
      if (!G->IsEdge(C.GetId(),C.GetOutNId(i)))
      {
        continue;
      }
      
      if (G->GetIntAttrDatN(C.GetOutNId(i),"cases") == 0 && G->GetIntAttrDatN(C.GetOutNId(i),"Quarantined") != 1)
      {
        
        G->AddIntAttrDatN(C.GetOutNId(i),2,"Quarantined");
        G->DelEdge(C.GetId(),C.GetOutNId(i));
        // nodeRemoval(G,C);

      }
    }
  }
  return 0;
}

vector<Predicted> getPredictions(PNEANet G)
{
  vector<Predicted> tempList;
  bool found = false;
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++)
  {
    if (G->GetIntAttrDatN(NI.GetId(),"Cases") > 0)
    {
      for (int i = 0; i < NI.GetOutDeg(); i++)
      {
        if (G->GetIntAttrDatN(NI.GetOutNId(i),"Cases") == 0)
        {
          found = false;
          // printf("This is the current country - %s\n",G->GetStrAttrDatN(NI.GetOutNId(i),"Country").CStr());
          for (int j = 0; j < tempList.size(); j++)
          {
            if (tempList.at(j).country.compare(string(G->GetStrAttrDatN(NI.GetOutNId(i),"Country").CStr())) == 0)
            {
              std::cout << "Found it already, ae bro" << endl;
              float tempChance = tempList.at(j).rate;
              // printf("Cases per million: %f\n", G->GetFltAttrDatN(NI.GetOutNId(i),"casesPerMillion"));
              // printf("FLights: %d\n",G->GetIntAttrDatE((G->GetEId(NI.GetId(),NI.GetOutNId(i))),"flights"));
              tempChance += (G->GetFltAttrDatN(NI.GetId(),"casesPerMillion") * float(G->GetIntAttrDatE((G->GetEId(NI.GetId(),NI.GetOutNId(i))),"flights")));     
          
              // std::cout << "THis is tempchance: " << tempChance << endl;
              tempList.at(j).rate = tempChance;
              found == true;
              break;
            }
          }

          if (!found)
          {
            if (G->GetIntAttrDatN(NI.GetOutNId(i),"Cases") == 0)
            {
            // std::cout << "Adding it ae bro" << endl;
            float tempChance = 0;
            tempChance = (G->GetFltAttrDatN(NI.GetId(),"casesPerMillion") * float(G->GetIntAttrDatE((G->GetEId(NI.GetId(),NI.GetOutNId(i))),"flights")));
            Predicted tempPredicted;
            tempPredicted.country = G->GetStrAttrDatN(NI.GetOutNId(i),"Country").CStr();
            tempPredicted.rate = tempChance;
            tempList.push_back(tempPredicted);
            }
          }
        }
        
      }
      
    }
    
  }
  return tempList;
}


// basic traversal. Troubleshooting etc.
int traverseGraph(PNEANet G)
{
  std::cout << "Nodes" << endl;
  std::cout << "_____________" << endl;
  traverseNodes(G);
  std::cout << "-------------" << endl << endl;
  std::cout << "Edges" << endl;
  std::cout << "_____________" << endl;
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
      // std::cout << "Node id: " << NI.GetId() << " Name: " << NI.GetStrAttrNames() << " In: " << NI.GetInDeg() << " Out: " << NI.GetOutDeg() << endl;
    }
    std::cout << endl;
    return 0;
}

int traverseEdges(PNEANet G)
{
  int counter = 0;
   for (TNEANet::TEdgeI EI = G->BegEI(); EI < G->EndEI(); EI++) 
    { 
      printf("Edge: %s->%s has %d",G->GetStrAttrDatN(EI.GetSrcNId(),"CountryName").CStr(),G->GetStrAttrDatN(EI.GetDstNId(),"CountryName").CStr(),G->GetIntAttrDatE(EI,"Flights"));
      // std::cout << "Edge: " << EI.GetSrcNDat().country << "->" << EI.GetDstNDat().country << " has " << EI.GetDat();
      if (counter < 1)
      {
        std::cout << " | ";
        counter++;
      }
      else
      {
        std::cout << endl;
        counter = 0;
      }
    }
    std::cout << endl;
    return 0;
}

int plotGraph(PNEANet G, TStr fileName)
{
  TIntStrH Name;
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++) 
  {
    TStr curr = G->GetStrAttrDatN(NI,"CountryName") + ":" + G->GetFltAttrDatN(NI,"casesPerMillion").GetStr();
    Name.AddDat(NI.GetId()) = curr;
  }
 
  std::cout << "Names Set" << endl;


  TIntStrH Colors;
  for (TNEANet::TNodeI NI = G->BegNI(); NI < G->EndNI(); NI++)
  {

    if (G->GetFltAttrDatN(NI,"casesPerMillion")>0)
    {
      // Red
      Colors.AddDat(NI.GetId()) ="#FF0000";
    }
    else if(G->GetIntAttrDatN(NI.GetId(),"Quarantined")==1)
    {
      // Blue
       Colors.AddDat(NI.GetId()) = "#0000ff";
    }
    else if(G->GetIntAttrDatN(NI.GetId(),"Quarantined")==2)
    {
      // Orange
      Colors.AddDat(NI.GetId()) = "#FFA500";
    }
    else
    {
      // Green
      Colors.AddDat(NI.GetId()) = "#008000";
    }
  }
  std::cout << "Colours set" << endl;
 
  
  string temp = ".png";
  TStr path = "Graphs/";
  path+= fileName.CStr();
  path += temp.c_str();
  std::cout << "Plotting Graph " << endl;
  TSnap::DrawGViz<PNEANet>(G, gvlNeato ,path.CStr(), fileName, false, Colors, Name);
  
  std::cout << "Done" << endl;
  return 0;
}

// Dispalying matrix
vector< vector<int> > initializeVector()
{
	vector<vector<int> > matrix;

	for (int i = 0; i <10; i++)
	{   vector<int> col;
	    matrix.push_back(col);
	    for (int j = 0; j <10; j++) 
	    {
	      matrix[i].push_back(0);
	    } 
	}
	return matrix;
}

vector< vector<int> > ChangeArry(PNEANet p,vector<vector<int> > matrix)
{
  TInt highest = 0;
  for (TNEANet::TNodeI NI = p->BegNI()++; NI < p->EndNI(); NI++)
  {
    if (NI.GetDeg() > highest)
    {
      highest = NI.GetDeg();
    }
  }

          int i = 0;
          for (TNEANet::TNodeI NI1 = p->BegNI(); NI1 < p->EndNI(); NI1++)
          {
            int j = 0;
            for (TNEANet::TNodeI NI2 = p->BegNI(); NI2 < p->EndNI(); NI2++)
            {
              int flights = p->GetIntAttrDatE(p->GetEId(NI1.GetId(),NI2.GetId()),"Flights");
              matrix[i][j] = flights;
              if (NI1.GetId() == NI2.GetId())
              {
                std::cout << "\033[97m"<< "■ \033[0m";
              }
              else if(flights<highest/9)
              {
                std::cout << "\033[90m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*2)
              {
                std::cout << "\033[96m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*3)
              {
                std::cout << "\033[36m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*4)
              {
                std::cout << "\033[92m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*5)
              {
                std::cout << "\033[93m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*6)
              {
                std::cout << "\033[33m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*7)
              {
                std::cout << "\033[91m"<< "■ \033[0m";
              }
              else if(flights<(highest/9)*8)
              {
                std::cout << "\033[31m"<< "■ \033[0m";
              }
              else if(flights <= highest)
              {
                std::cout << "\033[30m"<< "■ \033[0m";
              }
              
            
            std::cout << endl;
          }
        }
	return matrix;
}

void Print(vector<vector<int> > matrix)
{
  for (int i = 0; i < matrix.size(); i++) 
  { 
    for (int j = 0; j < matrix[i].size(); j++)
    {
      std::cout << matrix[i][j] << ""; 
      std::cout << endl; 
    } 
  } 
}


