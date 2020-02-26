using System;
using System.IO;
using System.Linq;
using System.Data;
using System.Collections.Generic;

namespace AIParsing
{
    class Program
    {
        static void Main(string[] args)
        {
            string filepath = "../../../Resources/airports.txt";
            var info = new System.IO.FileInfo(filepath);
            if (info.Length == 0)
            {
                Console.WriteLine("Weak file");
            }
            else
            {
                Console.WriteLine("Come in");
                string[] lines = File.ReadAllLines(filepath);
                List<string[]> inputList = new List<string[]>();
                for (int i = 0; i < lines.Length; i++)
                {
                    string[] line = new string[7];
                    line = lines[i].Split(',');
                    inputList.Add(line);
                }
                Console.WriteLine("it's open");


              /*  foreach (string[] viewlines in inputList)
                {
                    foreach (string viewline in viewlines)
                    {
                        Console.Write(viewline + " ");
                    }
                    Console.WriteLine();
                } */



                List<string> outputList = new List<string>();

                for (int i = 0; i < inputList.Count(); i++)
                {
                    string temp = inputList[i][3] + "," + inputList[i][4] + "," + inputList[i][5];
                    outputList.Add(temp);
                }


                System.IO.File.WriteAllLines("../../../Resources/airportsOutput.txt", outputList.ToArray());

                Console.WriteLine("Anyways, the Mercedes SLS");
            }
        }
    }
}
