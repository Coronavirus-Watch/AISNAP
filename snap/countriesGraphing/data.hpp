#include "stdafx.h"
#include <string>
#include <iostream>

class TNodeData 
{
    public:
        int id;
        std::string country;
        
        TNodeData(int INid = 0, std::string INcountry = "") {
            this->id = INid;
            this->country = INcountry;
        }

        TNodeData(size_t INid, std::string INcountry = "") {
            this->id = (int) INid;
            this->country = INcountry;
        }

        TNodeData(TSIn& SIn) { }
        void Save(TSOut& SOut) const { }
};


// class TEdgeData 
// {
//     public:
//         int flights;

//         TEdgeData(int flights = 1)
//         {
//             this->flights = flights;
//         }

//         void incrementFlights()
//         {
//             flights++;
//         }

//         TEdgeData(TSIn& SIn) { }
//         void Save(TSOut& SOut) const { }

//         bool operator<(const TEdgeData& e) 
//         {
//             return flights < e.flights;
//         }
// };