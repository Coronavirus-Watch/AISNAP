#!/bin/bash

# Used as default snap location
snapLocation=$(pwd)/Snap-5.0/examples

# Welcomes the user
welcome() {
    echo "Hello welcome to the Snap Project Creation Tool"
    echo "Copyright (c) 2020 by Max Kelly"
    echo "Licensed under the MIT License"
}

# Sets the snap location
setSnapLocation() {
    # Gets parameter passed
    check=$1
    # Checks if a parameter has been passed
    if [[ -n $check ]]; then
        snapLocation=$check
    fi
}

# Gets input from the user and stores it in input global variable
getInput() {
    read -p "Type the name for the new project: " input
}

# Checks if the snap directory is correct
snapDirCheck() {
    echo "Snap Location assumed: $snapLocation"
    if [[ -d $snapLocation ]]; then
        # Method based on that from Stackoverflow user Noam Manos
        # https://stackoverflow.com/questions/3231804/in-bash-how-to-add-are-you-sure-y-n-to-any-command-or-alias
        # Prompts user for input
        read -r -p "Is this your snap folder? [Y/n] " response
        # Makes response lower case
        response=${response,,} 
        # Checks for response
        if [[ "$response" =~ ^(no|n)$ ]]; then
            echo "Set the correct snap folder using the path as an argument when running the script"
            exit 1
        else
            echo "Creating directory"
        fi
    else
        echo "The snap folder doesn't exist, you can set one using the path as an argument when running the script"
        exit 1
    fi
}

# Creates the project
createDir() {
    # Checks that there isn't a blank directory
    if [[ ! -d $snapLocation/$input ]]; then
        # Creates directory
        mkdir $snapLocation/$input
        # Goes into the directory
        cd $snapLocation/$input
        # Creates files
        createCpp
        createMakefile
        createMakefileEx
        createStdafxCpp
        createStdafxH
        createTargetver
    else
        echo "Error: Directory already exists"
        exit 1
    fi
}

createCpp() {
    local filename=$snapLocation/$input/$input.cpp
    echo -e "#include \"stdafx.h\"\n" > $filename
    echo "int main(int argc, char* argv[]) {" >> $filename
    echo -e "\treturn 0;" >> $filename
    echo "}" >> $filename
}

createMakefile() {
    local filename=$snapLocation/$input/Makefile
    touch $filename
    echo "include ../../Makefile.config" > $filename
    echo "include Makefile.ex" >> $filename
    echo "include ../Makefile.exmain" >> $filename
}

createMakefileEx() {
    local filename=$snapLocation/$input/Makefile.ex
    touch $filename
    echo "MAIN = $input" > $filename
    echo "DEPH = " >> $filename
    echo "DEPCPP = " >> $filename
}

createStdafxCpp() {
    local filename=$snapLocation/$input/stdafx.cpp
    touch $filename
    echo "#include \"stdafx.h\"" > $filename
}

createStdafxH() {
    local filename=$snapLocation/$input/stdafx.h
    touch $filename
    echo -e "#pragma once\n" > $filename
    echo -e "#include \"targetver.h\"\n" >> $filename
    echo -e "#include \"Snap.h\"\n" >> $filename
}

createTargetver() {
    local filename=$snapLocation/$input/targetver.h
    touch $filename
    echo "#pragma once" > $filename
    echo "#ifndef _WIN32_WINNT" >> $filename
    echo "#define _WIN32_WINNT 0x0600" >> $filename
    echo "#endif" >> $filename
}

appendToMakefile() {
    local filename=$snapLocation/Makefile
    nano Makefile
}

# Main function
main() {
    # Sets the snap location
    setSnapLocation $1
    # Welcomes the user
    welcome
    # Gets input from the user and stores it in input global variable
    getInput
    # Checks if the snap directory is correct
    snapDirCheck
    # Creates the project
    createDir
}

# Runs main function
main $1