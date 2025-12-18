import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, BookOpen, FlaskConical, Atom, Calculator } from "lucide-react";

interface VideoLink {
  title: string;
  url: string;
}

interface FormContent {
  form: string;
  videos: VideoLink[];
}

interface SubjectData {
  name: string;
  icon: React.ReactNode;
  color: string;
  forms: FormContent[];
}

const subjectsData: SubjectData[] = [
  {
    name: "Mathematics",
    icon: <Calculator className="h-5 w-5" />,
    color: "bg-blue-500",
    forms: [
      {
        form: "Form One",
        videos: [
          { title: "Natural Numbers", url: "https://drive.google.com/file/d/1CunbXX7ZoOzq-OkGxCZxMJ7UdzoBYoX2/view?usp=drive_link" },
          { title: "Factors & Multiples", url: "https://drive.google.com/file/d/1Q5d94TexuBE44xVSaGaYJZcj0qjWGZiZ/view?usp=drive_link" },
          { title: "Integers", url: "https://drive.google.com/file/d/1-7QY9CXN6r79m2yvzCi6beCkHZMhJw_2/view?usp=drive_link" },
          { title: "Fractions", url: "https://drive.google.com/file/d/1e8FRuJuhA88wlLG6gGgwqUm2SWJcsIhS/view?usp=drive_link" },
          { title: "Decimals", url: "https://drive.google.com/file/d/1oD4H6ZBWDO9epbKZW9xqXApHEsdhyJ_o/view?usp=drive_link" },
          { title: "Squares & Square Roots", url: "https://drive.google.com/file/d/1Sj5AmsI0_H7BAlZgqpF1_RjHvyJ_W8gL/view?usp=drive_link" },
          { title: "Angles", url: "https://drive.google.com/file/d/16EnYaidHad_xAoB-dnzNEqFYmFyJOGBL/view?usp=drive_link" },
          { title: "Polygons", url: "https://drive.google.com/file/d/1zKJFBRLNgCxX80JYtymivAU3Rw4Xh0ps/view?usp=drive_link" },
          { title: "Length", url: "https://drive.google.com/file/d/12rxAvwRdANoC5WjQ9AcCHR6SDxJBtXJ6/view?usp=drive_link" },
          { title: "Geometric Constructions", url: "https://drive.google.com/file/d/1dYm5BtNYHoiQXxTEqmbMM3elRuXFR-TY/view?usp=drive_link" },
          { title: "Algebraic Expressions", url: "https://drive.google.com/file/d/19o2EUki7Xt5yJZ2DNiXPsDhAiEJauyVo/view?usp=drive_link" },
          { title: "Linear Equations", url: "https://drive.google.com/file/d/1SYiB3bYA0Kr-qYvcjxVseygcEntB4nZ7/view?usp=drive_link" },
          { title: "Coordinates & Graphs", url: "https://drive.google.com/file/d/10SMZH-EnWfYFuLKE2Y2bofnHQ_xWruTG/view?usp=drive_link" },
          { title: "Volume & Capacity", url: "https://drive.google.com/file/d/1NqIeaUAqDjF-4UEic7ZwasCUY3K23cCd/view?usp=drive_link" },
          { title: "Mass, Weight & Density", url: "https://drive.google.com/file/d/1s1zh1yudoT35nSDkHlka5A6UVroKFmM1/view?usp=drive_link" },
          { title: "Ratios & Rates", url: "https://drive.google.com/file/d/1D-Ow9sZOCby5dIba-Ji-88Fg4E1MJqOg/view?usp=drive_link" },
          { title: "Area", url: "https://drive.google.com/file/d/1-PavUjnbHOlZVQ8BC6HFoVqDY8smqVNE/view?usp=drive_link" },
          { title: "Scale Drawing and Angles", url: "https://drive.google.com/file/d/1lUy4FOiVFNVZrEIQGkfjLPtqcnG3Jtdm/view?usp=drive_link" },
          { title: "Bearing & Surveying", url: "https://drive.google.com/file/d/1RVtQslFnMyTgB3DwtLX3xAbS36ed7vlb/view?usp=drive_link" },
          { title: "Common Solids", url: "https://drive.google.com/file/d/16YsgxQXlsqlWfmGx0qWsrP9k8wWnGRoZ/view?usp=drive_link" },
          { title: "Commercial Arithmetic", url: "https://drive.google.com/file/d/1YYjHzzAnKqQTgUOd2CSz32LFZLZ5l1Nu/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Two",
        videos: [
          { title: "Cubes & Cube Roots", url: "https://drive.google.com/file/d/1cOHFZwydEWmc3OKKlmVIeyO8MOZOSLEv/view?usp=drive_link" },
          { title: "Reciprocals", url: "https://drive.google.com/file/d/1M1mBBoOFpXFTmvqZetNHG2-HRp31g3fj/view?usp=drive_link" },
          { title: "Indices", url: "https://drive.google.com/file/d/1YROPYw-nkPQIBAAhj_D--86nnLxP6FA6/view?usp=drive_link" },
          { title: "Common Logarithms", url: "https://drive.google.com/file/d/1ey4y_4g0f9t8LZrFKL4REMkyUmy6jGtS/view?usp=drive_link" },
          { title: "Equations of Straight Line", url: "https://drive.google.com/file/d/17o22I7XlhDjpge2FW3b4renEmgrmpgMm/view?usp=drive_link" },
          { title: "Equation & Congruence", url: "https://drive.google.com/file/d/1F96LCZXOWwx38lScmmIyfKEL6gKCjE5f/view?usp=drive_link" },
          { title: "Rotation", url: "https://drive.google.com/file/d/1m2jn1kSbGSaFeTel3ytcSSDPCc_mN-b0/view?usp=drive_link" },
          { title: "Similarities and Enlargement", url: "https://drive.google.com/file/d/1ChLeDvuMGYgsoCIWkSO3R2x5vRbl3qJ7/view?usp=drive_link" },
          { title: "The Pythagoras' Theorem", url: "https://drive.google.com/file/d/1M5jlUQxFomUqNWGcGej2aVvfzGA2Mqby/view?usp=drive_link" },
          { title: "Trigonometric Ratios", url: "https://drive.google.com/file/d/15OecR2vJtJpcWeO1ihIJB9xhFxW6UrgJ/view?usp=drive_link" },
          { title: "Area of a Triangle", url: "https://drive.google.com/file/d/1VQumZkOKKd9p8cWR5AVjsW-qn040GMX3/view?usp=drive_link" },
          { title: "Area of Polygons", url: "https://drive.google.com/file/d/1mC_G4pJQWAO-8HGipZFPrYaDA1D4C2y4/view?usp=drive_link" },
          { title: "Area of Part of a Circle", url: "https://drive.google.com/file/d/1XEeDQ8zc7xsW4PskwmhL7Yy_fHLMok_E/view?usp=drive_link" },
          { title: "Surface Area of Solids", url: "https://drive.google.com/file/d/1iULN4_xP2FKQZikXhkIK1FAu3AUwkHkf/view?usp=drive_link" },
          { title: "Volume of Solids", url: "https://drive.google.com/file/d/1RKQ1glhQqpUY91rj5w3DsPBXJmYCg_18/view?usp=drive_link" },
          { title: "Quadratic Expressions and Equations", url: "https://drive.google.com/file/d/1gr2uJGvQLjPojGchsw8FKNFaWt1vKnsS/view?usp=drive_link" },
          { title: "Linear Inequalities", url: "https://drive.google.com/file/d/1mDQsfNx1V6lOwqU5ElLnSU-KFF8bpdq-/view?usp=drive_link" },
          { title: "Angle Properties of a Circle", url: "https://drive.google.com/file/d/1ddhtUCU6EvhI5pqRI8YHi3vr_WB3lB2I/view?usp=drive_link" },
          { title: "Vectors", url: "https://drive.google.com/file/d/16wwcOW3ulo21HUcARco9WxkMW5CWX-xg/view?usp=drive_link" },
          { title: "Representation of Data", url: "https://drive.google.com/file/d/1VoKyqRXIMdHQm1noX1jFCUSHT-26U0m6/view?usp=drive_link" },
          { title: "Measures of Central Tendency", url: "https://drive.google.com/file/d/1j1WxbJB63dxTggm47ZOc2aR8a0W5x-Ck/view?usp=drive_link" },
          { title: "Linear Motion", url: "https://drive.google.com/file/d/1eNlNQbIXc2GG0fwXGur_ovUOc-CDMmYy/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Three",
        videos: [
          { title: "Quadratic Expressions & Equations", url: "https://drive.google.com/file/d/1Xsg2r4HqvdB31jTzjVG55cVrHW-RbuC7/view?usp=drive_link" },
          { title: "Approximation & Errors", url: "https://drive.google.com/file/d/19za6IYAJ9cprzMhrJv2k_V18-miO60MY/view?usp=drive_link" },
          { title: "Trigonometric Ratios", url: "https://drive.google.com/file/d/1ffvyMwIHPBQMCy7MhJSpnxBxeHxuuZGY/view?usp=drive_link" },
          { title: "Surds", url: "https://drive.google.com/file/d/1lVsmB4kzmfjQMSeyAmOSyjh07G9qaXME/view?usp=drive_link" },
          { title: "Logarithms", url: "https://drive.google.com/file/d/11cqtpo34H3whKTuxlqpH-CAhpaEJUDeL/view?usp=drive_link" },
          { title: "Commercial Arithmetic", url: "https://drive.google.com/file/d/1NRK-iPZpZqgfbS6lF-QrBiyvBr6GWbcT/view?usp=drive_link" },
          { title: "Circles, Chords & Tangents", url: "https://drive.google.com/file/d/1Teutnk1AHcYnc65ydb5qNR4UXC0EQ8SL/view?usp=drive_link" },
          { title: "Matrices", url: "https://drive.google.com/file/d/1hVWnCKxHy1UU7isUSjuUVw9tBupVu97b/view?usp=drive_link" },
          { title: "Formula and Variation", url: "https://drive.google.com/file/d/12l3iqzbRWyVmRiw98u0NCYR7_OUaD3-3/view?usp=drive_link" },
          { title: "Sequences and Series", url: "https://drive.google.com/file/d/165sFk9NbSaLe-iQhaYfMq0kRuJ6zgYkV/view?usp=drive_link" },
          { title: "Vectors", url: "https://drive.google.com/file/d/1Yhf57I-vZjdoXQdSljMtrECFXono2H4c/view?usp=drive_link" },
          { title: "Binomial Expansion", url: "https://drive.google.com/file/d/13uW6mn1g4na7bsHBmYcRMY5DPfTcbOwl/view?usp=drive_link" },
          { title: "Probability", url: "https://drive.google.com/file/d/1U9oML_gkGqIyhH_e6RF5b7cGxDJ0h_9p/view?usp=drive_link" },
          { title: "Compound Proportion & Rate of Work", url: "https://drive.google.com/file/d/1vdpWkQBLdtdZPOqUn7CmDUckEXU7h0pc/view?usp=drive_link" },
          { title: "Graphical Methods", url: "https://drive.google.com/file/d/1JAbdji26XogVUB1pfbM7rLX37gU7Sf3R/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Four",
        videos: [
          { title: "Matrices & Transformation", url: "https://drive.google.com/file/d/1WPu2BUI6JUh7yXO9kKtcBPy-wUe78PqQ/view?usp=drive_link" },
          { title: "Statistics", url: "https://drive.google.com/file/d/1KQFMCg0ylfuaHV9OyThUspXdLAwqsZyQ/view?usp=drive_link" },
          { title: "Locus", url: "https://drive.google.com/file/d/1fKlfjif9vyFJz6Ook32CGDbre4WgsCOa/view?usp=drive_link" },
          { title: "Trigonometric Ratios", url: "https://drive.google.com/file/d/1DQs5NxnAC300P6wKeWKZrM0vzDw-94vr/view?usp=drive_link" },
          { title: "Three Dimensional Geometry", url: "https://drive.google.com/file/d/1Y441bBW4tXFyFYRypbQc8pB1DxvtZ_p4/view?usp=drive_link" },
          { title: "Latitudes and Longitudes", url: "https://drive.google.com/file/d/1hiX8l5lZcobdeHil5zwAN7TIp6cNMzwd/view?usp=drive_link" },
          { title: "Linear Programming", url: "https://drive.google.com/file/d/1owRWi7bR6TUIF_p-CTfiYiR9OoOGBMOV/view?usp=drive_link" },
          { title: "Differentiation", url: "https://drive.google.com/file/d/1GWTqXwXw5Nx_J3SedxV1NfoW1u0fZ8tG/view?usp=drive_link" },
          { title: "Approximation of Area", url: "https://drive.google.com/file/d/1kUOb5XwDMXJVrfh83RjNpIRrN1MKWFt1/view?usp=drive_link" },
          { title: "Integration", url: "https://drive.google.com/file/d/1HNhwlUfn5OcVBCyfEn6b_vntEOBmWDH3/view?usp=drive_link" },
        ],
      },
    ],
  },
  {
    name: "Chemistry",
    icon: <FlaskConical className="h-5 w-5" />,
    color: "bg-green-500",
    forms: [
      {
        form: "Form One",
        videos: [
          { title: "Introduction to Chemistry", url: "https://drive.google.com/file/d/1lIE_tU12NgCNetKKNsok666kl4dfvwHv/view?usp=drive_link" },
          { title: "Simple Classification of Substance", url: "https://drive.google.com/file/d/1__NiJoColLbdzWyHDGbXxg9Q17lF9vbG/view?usp=drive_link" },
          { title: "Effect of Heat on Substance", url: "https://drive.google.com/file/d/1GIdhzhosOiIXearigkxr5kRzkPUwvVxZ/view?usp=drive_link" },
          { title: "Acids, Bases & Indicators", url: "https://drive.google.com/file/d/1U-7zaaLa2oodfbmp0eHnEtG4qQXC5gRj/view?usp=drive_link" },
          { title: "Air & Combustion", url: "https://drive.google.com/file/d/1VIkwunwMiApixJYtDH__UbIVQ8bD_khT/view?usp=drive_link" },
          { title: "Water & Hydrogen", url: "https://drive.google.com/file/d/1oJzvpIBUEQ8neOcNUiYBG3vE4oSp-7u2/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Two",
        videos: [
          { title: "Atomic Structure & The Periodic Table", url: "https://drive.google.com/file/d/1TmH8J7kjAFZj3YZC8IGCNX-GeEUgrsiH/view?usp=drive_link" },
          { title: "Chemical Families", url: "https://drive.google.com/file/d/1lKnMQV0njZ7qmJOWxKd7iUkJhkWMI8-H/view?usp=drive_link" },
          { title: "Structure & Bonding", url: "https://drive.google.com/file/d/1G5YaLOGAtew-N5AsZxFzO3mpxzLS0pON/view?usp=drive_link" },
          { title: "Salts", url: "https://drive.google.com/file/d/1gymzZS1O7ZIAkzEetWN89lucnrBqG_8b/view?usp=drive_link" },
          { title: "Effect of Electric Current on Substances", url: "https://drive.google.com/file/d/1qzF4tAYyASIseY_Vb-nNCLbuB2B4lDsF/view?usp=drive_link" },
          { title: "Carbon & Some of Its Compounds", url: "https://drive.google.com/file/d/1uEQaewKXS2qmzWpPmTvMdhC5hjaLWTyK/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Three",
        videos: [
          { title: "Gas Laws", url: "https://drive.google.com/file/d/1GsNjRwMjRR6KdMGkt8hWTEZqN--V4i-5/view?usp=drive_link" },
          { title: "The Mole", url: "https://drive.google.com/file/d/1zGPtetoYx-wTE2qT21xk-11ZQfA-BYI5/view?usp=drive_link" },
          { title: "Volumetric Analysis", url: "https://drive.google.com/file/d/1koCWq2d6PPuEAOLaDMFBV0-YbqmVFl2G/view?usp=drive_link" },
          { title: "Nitrogen & Its Compound", url: "https://drive.google.com/file/d/1_bMU6kw0QjgdxyHaObn04MDYffthEUG5/view?usp=drive_link" },
          { title: "Chlorine & Its Compound", url: "https://drive.google.com/file/d/1Q_JzZUQkX2uw9BU-nhnw0CK8Kiz7b-qC/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Four",
        videos: [
          { title: "Organic Chemistry II", url: "#" },
          { title: "Acid, Bases & Salts", url: "#" },
          { title: "Energy Changes in Chemical and Physics Processes", url: "#" },
          { title: "Reaction Chemistry", url: "#" },
          { title: "Radioactivity", url: "#" },
        ],
      },
    ],
  },
  {
    name: "Biology",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-emerald-500",
    forms: [
      {
        form: "Form One",
        videos: [
          { title: "Introduction to Biology", url: "https://drive.google.com/file/d/1lIE_tU12NgCNetKKNsok666kl4dfvwHv/view?usp=drive_link" },
          { title: "Simple Classification of Substance", url: "https://drive.google.com/file/d/1__NiJoColLbdzWyHDGbXxg9Q17lF9vbG/view?usp=drive_link" },
          { title: "Effect of Heat on Substance", url: "https://drive.google.com/file/d/1GIdhzhosOiIXearigkxr5kRzkPUwvVxZ/view?usp=drive_link" },
          { title: "Acids, Bases & Indicators", url: "https://drive.google.com/file/d/1U-7zaaLa2oodfbmp0eHnEtG4qQXC5gRj/view?usp=drive_link" },
          { title: "Air & Combustion", url: "https://drive.google.com/file/d/1VIkwunwMiApixJYtDH__UbIVQ8bD_khT/view?usp=drive_link" },
          { title: "Water & Hydrogen", url: "https://drive.google.com/file/d/1oJzvpIBUEQ8neOcNUiYBG3vE4oSp-7u2/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Two",
        videos: [
          { title: "Transport in Plants and Animals", url: "#" },
          { title: "Respiration", url: "#" },
          { title: "Gaseous Exchange in Plants and Animals", url: "#" },
          { title: "Excretion and Homeostasis", url: "#" },
        ],
      },
      {
        form: "Form Three",
        videos: [
          { title: "Classification of Living Things (I)", url: "https://drive.google.com/file/d/1EYrXsZeHeq1mTXnxp0EL7Fk0Es0Os2e_/view?usp=drive_link" },
          { title: "Classification of Living Things (II)", url: "https://drive.google.com/file/d/1deblKcy30SgaBoLsQmw1UbwI9d6DhqrR/view?usp=drive_link" },
          { title: "Ecology", url: "https://drive.google.com/file/d/1dQLgj5OaJ3GEa2ZJs1qVoDk6vydFJA0c/view?usp=drive_link" },
          { title: "The Cell Division", url: "https://drive.google.com/file/d/1gF7E6rtjLo-iTqkBFKlb_f2RTsCT3V5J/view?usp=drive_link" },
          { title: "Reproduction I", url: "https://drive.google.com/file/d/1vHB1gd8sbbY_MY_1m9WxcsCclLW222DY/view?usp=drive_link" },
          { title: "Reproduction II", url: "https://drive.google.com/file/d/1OfW0lfpg2AnSMAmeaoo-5ntQVIcR8j_e/view?usp=drive_link" },
          { title: "Growth and Development", url: "https://drive.google.com/file/d/1gBecj4W0lXu0ioRdq3EWWyyiyNoxR_d7/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Four",
        videos: [
          { title: "Genetics (Variation)", url: "https://drive.google.com/file/d/1j5lcISdf8RoRoB_O-sKTd5IYlu-LPyAG/view?usp=drive_link" },
          { title: "Genetics (Heredity)", url: "https://drive.google.com/file/d/1JnyLh4A6p6dp-3nXzc2rVKzKGvGXcy1x/view?usp=drive_link" },
          { title: "Evolution", url: "https://drive.google.com/file/d/1UyMcVJNPGY6toYVQ9pT8TWrhL37M0rur/view?usp=drive_link" },
          { title: "Reception, Response and Coordination in Plants", url: "https://drive.google.com/file/d/1BNeyEq8uFsKqdQC2-9zivNoLDAzxlyQ3/view?usp=drive_link" },
          { title: "Reception, Response and Coordination in Animals", url: "https://drive.google.com/file/d/1LYgH1MeaqSF6hECopnJmFqJZMjw3m85k/view?usp=drive_link" },
          { title: "Support & Movement", url: "https://drive.google.com/file/d/1lEh-tNGnX38DR9OPAqAug30OpUOsApD4/view?usp=drive_link" },
        ],
      },
    ],
  },
  {
    name: "Physics",
    icon: <Atom className="h-5 w-5" />,
    color: "bg-purple-500",
    forms: [
      {
        form: "Form One",
        videos: [
          { title: "Introduction to Physics", url: "https://drive.google.com/file/d/1QjjMnsqGApC6MCObDaK95R7_9F80Bh2E/view?usp=drive_link" },
          { title: "Measurement", url: "https://drive.google.com/file/d/150ZxwPxtmKaJTDyLXSMjYLIS24C7J1Qr/view?usp=drive_link" },
          { title: "Force", url: "https://drive.google.com/file/d/17868Tedr0C_sr-6SWF0dhHtN9mNeug3k/view?usp=drive_link" },
          { title: "Pressure", url: "https://drive.google.com/file/d/1LtD1hnxG6XSIiLzuEYqLZQCTBVgExtUy/view?usp=drive_link" },
          { title: "The Particulate Nature of Matter", url: "https://drive.google.com/file/d/1KL3ZZaAmqFXggTrmLPKD7nyWgUxF4ZYU/view?usp=drive_link" },
          { title: "Thermal Expansion", url: "https://drive.google.com/file/d/1PpZT1NJiFe-gW7qdijYZW4UwadCwr0Av/view?usp=drive_link" },
          { title: "Heat Transfer", url: "https://drive.google.com/file/d/1cO6Xktli94zFO-JK6YxeRq2Rtv8R6Oya/view?usp=drive_link" },
          { title: "Rectilinear Propagation of Light", url: "https://drive.google.com/file/d/1R230b44AwVIol5njwg_C8Hw6sqIaP-1q/view?usp=drive_link" },
          { title: "Electrostatics I", url: "https://drive.google.com/file/d/1SxEZFb1T3RYE-Cko-BGvY9WFB1PcusV7/view?usp=drive_link" },
          { title: "Cell & Simple Circuits", url: "https://drive.google.com/file/d/1hJKN_dndFr1OYdRf6mcelnihpaC0dGJQ/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Two",
        videos: [
          { title: "Magnetism", url: "https://drive.google.com/file/d/1BKCYZQuMzOUqvgZhq4_SJReHdxl_35jP/view?usp=drive_link" },
          { title: "Measurement II", url: "https://drive.google.com/file/d/1uvjtteBnFA7mGlbrrHmjXnm1WTBfP0kj/view?usp=drive_link" },
          { title: "Turning Effect of a Force", url: "https://drive.google.com/file/d/1DEc_P7u8KQMNW2pUWmMNx1l3lQAUZQ01/view?usp=drive_link" },
          { title: "Equilibrium & Center of Gravity", url: "https://drive.google.com/file/d/1u7nRyVSqez_5bPd_pM6RhHw-Ta9UmfNe/view?usp=drive_link" },
          { title: "Reflection on Curved Surfaces", url: "https://drive.google.com/file/d/1YGykzWvugO1b1rMtdwNctC-ZJtwnzIoW/view?usp=drive_link" },
          { title: "Magnetic Effect of an Electric Current", url: "https://drive.google.com/file/d/1jgDrgVCImhywNUdy40de1gdm1CZfnLDc/view?usp=drive_link" },
          { title: "Hooke's Law", url: "https://drive.google.com/file/d/1r2HEn61nw4Q5v8alM4MgYYbGiTGz7nFv/view?usp=drive_link" },
          { title: "Waves", url: "https://drive.google.com/file/d/1fpRVrHO4aqQVzCeb_bF43_G6aCBvTlHF/view?usp=drive_link" },
          { title: "Sound", url: "https://drive.google.com/file/d/1HLLLJRsZfGLFQEjwTN4x0l7X94FKrHRy/view?usp=drive_link" },
          { title: "Fluid Flow", url: "https://drive.google.com/file/d/1ylyawzOrRObroFZirDD0N8tSaQGFuX16/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Three",
        videos: [
          { title: "Linear Motion I", url: "https://drive.google.com/file/d/1vvv9DsglvfZsnNDu63iQ9gyomY_1B-dp/view?usp=drive_link" },
          { title: "Linear Motion II", url: "https://drive.google.com/file/d/1b237L6-U0iyk5SDa3EbO1ibmKkeNP44z/view?usp=drive_link" },
          { title: "Refraction of Light", url: "https://drive.google.com/file/d/1p8-_-wBvDCjx8o2YyDG-jFRA0c6FB1e6/view?usp=drive_link" },
          { title: "Newton's Laws of Motion", url: "https://drive.google.com/file/d/1B3wnYaesgr12PLzSmBelobpIB-Fl7g1Y/view?usp=drive_link" },
          { title: "Work, Energy, Power & Machines", url: "https://drive.google.com/file/d/1dCAqKvkpBJeMEv-XnSGX7qSF8r8dgtuQ/view?usp=drive_link" },
          { title: "Current Electricity", url: "https://drive.google.com/file/d/1th5LXnxEevUK2CJMD5s7B6eDWe0c3myt/view?usp=drive_link" },
          { title: "Waves II", url: "https://drive.google.com/file/d/1rLgQS5_gi26OlNiW69kTe3cGlJMelETS/view?usp=drive_link" },
          { title: "Electrostatics", url: "https://drive.google.com/file/d/1YisEu9RmNsBZJA_G6-6rwRNJ59puaEdS/view?usp=drive_link" },
          { title: "Heating Effect of an Electric Current", url: "https://drive.google.com/file/d/1YisEu9RmNsBZJA_G6-6rwRNJ59puaEdS/view?usp=drive_link" },
          { title: "Quantity of Heat", url: "https://drive.google.com/file/d/1RsAwhraTLWXJpJo2N3-STqP4_HaK_2TS/view?usp=drive_link" },
          { title: "Gas Laws", url: "https://drive.google.com/file/d/1byJNsT-e_k2SYg_1M8V5hivb8ykHmxom/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Four",
        videos: [
          { title: "Thin Lenses", url: "https://drive.google.com/file/d/1mM6uLiSHE-NxNg8GQJif2eHtMp62Rv7D/view?usp=drive_link" },
          { title: "Uniform Circular Motion", url: "https://drive.google.com/file/d/1tY48sRjoaecSekz-nyn452cNY4T3lYmw/view?usp=drive_link" },
          { title: "Floatation & Sinking", url: "https://drive.google.com/file/d/1xBq7oP1vtF_xm2jizV9YzbruRMRe1L0Z/view?usp=drive_link" },
          { title: "Electromagnetic Spectrum", url: "https://drive.google.com/file/d/1W2P_h5HwCUJqXh3dq3sU1s1jCpJwvDEE/view?usp=drive_link" },
          { title: "Electromagnetic Induction", url: "https://drive.google.com/file/d/1wiKzjINnuazH7HufQ1RCI6Nr1hiB8-ex/view?usp=drive_link" },
          { title: "Mains Electricity", url: "https://drive.google.com/file/d/10DUA0QkKugEVxqh5CH5tFrx39P8Optym/view?usp=drive_link" },
          { title: "Cathode Rays & Cathode Ray Tube", url: "https://drive.google.com/file/d/1thFuzPV4U84krsvSBjOmjs1VObqyHRed/view?usp=drive_link" },
          { title: "X-Rays", url: "https://drive.google.com/file/d/1uuzWLQfIGN70iD7oZ6HluA1fbM6g976P/view?usp=drive_link" },
          { title: "Photoelectric Effect", url: "https://drive.google.com/file/d/12ESyJVwEpj00-jumMk1PL6i7GQnFCUYY/view?usp=drive_link" },
          { title: "Radioactivity", url: "https://drive.google.com/file/d/1yoyq1LdEnU9cn_HckoVaAWqsc9fUsOck/view?usp=drive_link" },
          { title: "Electronics", url: "https://drive.google.com/file/d/16JJtTLoW2vn8wUvRb5rTW-ijdX781gEr/view?usp=drive_link" },
        ],
      },
    ],
  },
];

const LearningPage = () => {
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedForm, setSelectedForm] = useState("Form One");

  const currentSubject = subjectsData.find((s) => s.name === selectedSubject);
  const currentForm = currentSubject?.forms.find((f) => f.form === selectedForm);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Center</h1>
        <p className="text-gray-600">
          Access video lessons and animations for Mathematics, Chemistry, Biology, and Physics
        </p>
      </div>

      {/* Subject Tabs */}
      <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
          {subjectsData.map((subject) => (
            <TabsTrigger
              key={subject.name}
              value={subject.name}
              className={`flex items-center gap-2 py-3 px-4 rounded-lg border-2 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 bg-white border-gray-200 hover:border-gray-300 transition-all`}
            >
              <span className={`p-1.5 rounded-md text-white ${subject.color}`}>
                {subject.icon}
              </span>
              <span className="font-medium">{subject.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {subjectsData.map((subject) => (
          <TabsContent key={subject.name} value={subject.name} className="space-y-6">
            {/* Form Selection */}
            <div className="flex flex-wrap gap-2">
              {subject.forms.map((form) => (
                <Badge
                  key={form.form}
                  variant={selectedForm === form.form ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                    selectedForm === form.form
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedForm(form.form)}
                >
                  {form.form}
                  <span className="ml-2 text-xs opacity-75">
                    ({form.videos.length} videos)
                  </span>
                </Badge>
              ))}
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentForm?.videos.map((video, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                  onClick={() => video.url !== "#" && window.open(video.url, "_blank")}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-2 rounded-lg text-white ${subject.color} opacity-90`}
                      >
                        <Play className="h-4 w-4" />
                      </div>
                      {video.url !== "#" && (
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {video.title}
                    </CardTitle>
                    {video.url === "#" && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {currentForm?.videos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No videos available for this form yet.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LearningPage;
