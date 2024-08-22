cmake_minimum_required(VERSION 3.28)
project(browser_game_server)

set(CMAKE_CXX_STANDARD 17)

include_directories(./vcpkg/installed/arm64-osx/include)

find_package(Crow CONFIG REQUIRED)
link_libraries(${CROW_LIBRARIES})

find_package(Asio CONFIG REQUIRED)
link_libraries(${ASIO_LIBRARIES})

find_package(Bullet CONFIG REQUIRED)
link_libraries(${BULLET_LIBRARIES})

find_package(nlohmann_json 3.2.0 REQUIRED)
link_libraries(nlohmann_json::nlohmann_json)

add_executable(browser_game_server
        main.cpp

        scene/tree.hpp
        scene/tree.cpp
        scene/game-object.hpp
        scene/game-object.cpp
        scene/physics_world.hpp
        scene/physics_world.cpp
        scene/scene.hpp
        scene/scene.cpp

        scene/components/component.hpp
        scene/components/component.cpp
        scene/components/components-manager.hpp
        scene/components/components-manager.cpp
        scene/components/transform.hpp
        scene/components/transform.cpp
)
