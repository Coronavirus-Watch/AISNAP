#include <iostream>
#include <vector>
#include <map>
#include "stdafx.h"

int addRoute(PNodeEdgeNet graph, std::vector<Route> list)
{
	std::map<int, std::string> countriesIndex;
	for (size_t i = 0; i < list.size; i++)
	{
		// Adds countries to index if they aren't already added
		countriesIndex.insert(list.source);
		countriesIndex.insert(list.dest);
		// Adds country to graph if they aren't already added
		graph.AddNode(countriesIndex.size);

		// Checks if the edge we are adding exists
		if (graph.isEdge(list.source, list.dest)
		{
			// Increment edge number
			int edgeID = graph.GetEId(list.source, list.dest);
			int data = GetEDat(edgeID) + 1;
			graph.SetEDat(edgeID, data);
		}
		else
		{
			// Adds edge to graph
			graph.AddEdge(list.source, list.dest);
		}
	}
	return countriesIndex;
}

int main(int argc, char *argv[])
{
	PNodeEdgeNet graph;
	std::vector<Route> list;
	return addRoute();
}
