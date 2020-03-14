#pragma once

// Run: sudo apt install nlohmann-json3-dev
// Website: https://github.com/nlohmann/json
#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <nlohmann/json.hpp>

namespace std {
    inline nlohmann::json get_untyped(const nlohmann::json & j, const char * property) {
        if (j.find(property) != j.end()) {
            return j.at(property).get<nlohmann::json>();
        }
        return nlohmann::json();
    }

    inline nlohmann::json get_untyped(const nlohmann::json & j, std::string property) {
        return get_untyped(j, property.data());
    }

    struct Country {
        int64_t cases;
        int64_t deaths;
        int64_t recovered;
        std::string name;
    };

    struct Day {
        std::vector<Country> countries;
        std::string day;
    };
}

namespace nlohmann {
    void from_json(const json & j, std::Country & x);
    void to_json(json & j, const std::Country & x);

    void from_json(const json & j, std::Day & x);
    void to_json(json & j, const std::Day & x);

    inline void from_json(const json & j, std::Country& x) {
        std::cout << "We've converting from Json, chief" << std::endl;
        x.cases = j.at("cases").get<int64_t>();
        std::cout << "reeee" << std::endl;
        x.deaths = j.at("deaths").get<int64_t>();
        x.recovered = j.at("recovered").get<int64_t>();
        x.name = j.at("name").get<std::string>();
    }

    inline void to_json(json & j, const std::Country & x) {
        j = json::object();
        j["cases"] = x.cases;
        j["deaths"] = x.deaths;
        j["recovered"] = x.recovered;
        j["name"] = x.name;
    }

    inline void from_json(const json & j, std::Day& x) {
        std::cout << "Thats gay" << std::endl;
        std::Country y;
        std::cout << j.get<std::string>();
        // x.countries = from_json(j,y);
        // x.day = j.at("day").get<std::string>();
    }

    inline void to_json(json & j, const std::Day & x) {
        j = json::object();
        j["countries"] = x.countries;
        j["day"] = x.day;
    }
}

namespace std {
    string brandonPath = "timeline.json";
    string path = brandonPath;

    int importFiles(vector<Day> &days) {
        ifstream fyallStream;
        fyallStream.open(path);
        cout << "We got to here" << endl;
        nlohmann::json j;
        Day d;
        if (fyallStream.is_open()) {
            cout << "The file's open" << endl;
            fyallStream >> j;
            nlohmann::from_json(j, d);
        }
        else {
            cout << "File import failed" << endl;
            return 1;
        }
        fyallStream.close();
        return 0;
    }
}