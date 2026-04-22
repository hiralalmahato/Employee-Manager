
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy full repo
COPY . .

# Move into Employee folder (where pom.xml exists)
WORKDIR /app/Employee

# Build jar
RUN mvn clean package -DskipTests



FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy built jar
COPY --from=build /app/Employee/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]