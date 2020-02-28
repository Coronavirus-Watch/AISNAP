#include "stdafx.h"
#include <string>
#include <iostream>

class TNodeData 
{
    public:
        int id;
        std::string country;
        
        TNodeData(int id, std::string country = "") {
            this->id = id;
            this->country = country;
        }

        TNodeData(size_t id, std::string country = "") {
            this->id = (int) id;
            this->country = country;
        }
};


class TEdgeData 
{
    public:
        int flights = 1;

        void incrementFlights()
        {
            flights++;
        }
};