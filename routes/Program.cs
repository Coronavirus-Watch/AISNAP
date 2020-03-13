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
           // parseFile();
            clearDomestic();
            
        }


        static void parseFile()
        {
        	string filepath = "../../../Resources/airports.txt";
            var info = new System.IO.FileInfo(filepath);
            if (info.Length == 0)
            {
                Console.WriteLine("Weak file");
            }
            else
            {
                Console.WriteLine("Start");
                string[] lines = File.ReadAllLines(filepath);
                List<string[]> inputList = new List<string[]>();
                for (int i = 0; i < lines.Length; i++)
                {
                    string[] line = new string[4];
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
                    string temp = inputList[i][1] + "," + inputList[i][2] + "," + inputList[i][3];
                    outputList.Add(temp);
                }


                System.IO.File.WriteAllLines("../../../Resources/countriesOutput.txt", outputList.ToArray());

                Console.WriteLine("completed");
            }
        }
        static void parseFiles()
        {
            string filepath = "../../../Resources/routesOutput.txt";
            string filepath2 = "../../../Resources/airportsOutput.txt";
            var info = new System.IO.FileInfo(filepath);
            var info2 = new System.IO.FileInfo(filepath2);
            if (info.Length == 0)
            {
                Console.WriteLine("Weak file");
            }
            else
            {
                Console.WriteLine("Come in");
                string[] lines1 = File.ReadAllLines(filepath);
                List<string[]> inputList1 = new List<string[]>();
                for (int i = 0; i < lines1.Length; i++)
                {
                    string[] line = new string[2];
                    line = lines1[i].Split(',');
                    inputList1.Add(line);
                }
                string[] lines2 = File.ReadAllLines(filepath2);
                List<string[]> inputList2 = new List<string[]>();
                for (int i = 0; i < lines2.Length; i++)
                {
                    string[] line = new string[3];
                    line = lines2[i].Split(',');
                    inputList2.Add(line);
                }
                Console.WriteLine("it's open");

                /*
                  foreach (string[] viewlines in inputList2)
                  {
                      foreach (string viewline in viewlines)
                      {
                          Console.Write(viewline + " ");
                      }
                      Console.WriteLine();
                  } */



                List<string> outputList = new List<string>();

                for (int i = 0; i < inputList1.Count(); i++)
                {
                    string[] country = new string[2];
                    for (int k = 0; k < 2; k++)
                    {
                        for (int j = 0; j < inputList2.Count(); j++)
                        {
                            if ((string.Compare(inputList1[i][k],inputList2[j][1]) == 0 || string.Compare(inputList1[i][k],inputList2[j][2]) == 0))
                            {
                                country[k] = inputList2[j][0];
                                break;
                            }
                        }
                    }
                    string temp = inputList1[i][0] + "," + country[0] + "," + inputList1[i][1] + "," + country[1];
                    outputList.Add(temp);
                    Console.WriteLine(i + " of " + inputList1.Count());
                }


                System.IO.File.WriteAllLines("../../../Resources/parsedOutput.txt", outputList.ToArray());
                
                Console.WriteLine("Anyways, the Mercedes SLS");
            }
        }
    
    
        static void clearDomestic()
        {
            string filepath = "../../../Resources/parsedDomesticsOutput.txt";
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
                    string[] line = new string[4];
                    line = lines[i].Split(',');
                    inputList.Add(line);
                }

                int domestics = 0;
                for (int i = 0; i < inputList.Count(); i++)
                {
                    if (string.Compare(inputList[i][1],inputList[i][3]) == 0 || string.Compare(inputList[i][1],"") == 0 || string.Compare(inputList[i][3], "") == 0 || string.Compare(inputList[i][4],"") == 0)
                    {
                        inputList.RemoveAt(i);
                        i--;
                        domestics++;
                    }
                }

                Console.WriteLine(domestics + " domestics occured");
                List<string> outputList = new List<string>();
                for (int i = 0; i < inputList.Count(); i++)
                {
                    string temp = inputList[i][0] + "," + inputList[i][1] + "," + inputList[i][2] + "," + inputList[i][3];
                    outputList.Add(temp);
                }

                System.IO.File.WriteAllLines("../../../Resources/parsedDomesticsOutput.txt", outputList.ToArray());
                Console.WriteLine("Anyways, the Mercedes SLS");

            }
        }

    }
}
